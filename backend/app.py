from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import jwt
import os
from functools import wraps
from collections import defaultdict, deque

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/cms_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

db = SQLAlchemy(app)
CORS(app)

# In-memory recently viewed tracker using basic collections
recently_viewed = defaultdict(lambda: deque(maxlen=10))

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    articles = db.relationship('Article', backref='author', lazy=True)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Auth decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(username=data['username'], password=data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    
    if user:
        token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'])
        return jsonify({'token': token, 'user_id': user.id})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/articles', methods=['GET'])
@token_required
def get_articles(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    articles = Article.query.filter_by(user_id=current_user.id).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'articles': [{
            'id': article.id,
            'title': article.title,
            'content': article.content,
            'created_at': article.created_at.isoformat(),
            'updated_at': article.updated_at.isoformat()
        } for article in articles.items],
        'total': articles.total,
        'pages': articles.pages,
        'current_page': page
    })

@app.route('/articles', methods=['POST'])
@token_required
def create_article(current_user):
    data = request.get_json()
    article = Article(
        title=data['title'],
        content=data['content'],
        user_id=current_user.id
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'message': 'Article created', 'id': article.id}), 201

@app.route('/articles/<int:article_id>', methods=['GET'])
@token_required
def get_article(current_user, article_id):
    article = Article.query.filter_by(id=article_id, user_id=current_user.id).first()
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    
    # Track recently viewed
    user_recent = recently_viewed[current_user.id]
    if article_id in user_recent:
        user_recent.remove(article_id)
    user_recent.append(article_id)
    
    return jsonify({
        'id': article.id,
        'title': article.title,
        'content': article.content,
        'created_at': article.created_at.isoformat(),
        'updated_at': article.updated_at.isoformat()
    })

@app.route('/articles/<int:article_id>', methods=['PUT'])
@token_required
def update_article(current_user, article_id):
    article = Article.query.filter_by(id=article_id, user_id=current_user.id).first()
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    
    data = request.get_json()
    article.title = data.get('title', article.title)
    article.content = data.get('content', article.content)
    article.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Article updated'})

@app.route('/articles/<int:article_id>', methods=['DELETE'])
@token_required
def delete_article(current_user, article_id):
    article = Article.query.filter_by(id=article_id, user_id=current_user.id).first()
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted'})

@app.route('/articles/recent', methods=['GET'])
@token_required
def get_recent_articles(current_user):
    recent_ids = list(recently_viewed[current_user.id])
    recent_ids.reverse()  # Most recent first
    
    articles = []
    for article_id in recent_ids:
        article = Article.query.filter_by(id=article_id, user_id=current_user.id).first()
        if article:
            articles.append({
                'id': article.id,
                'title': article.title,
                'content': article.content[:100] + '...' if len(article.content) > 100 else article.content,
                'created_at': article.created_at.isoformat()
            })
    
    return jsonify({'recent_articles': articles})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)