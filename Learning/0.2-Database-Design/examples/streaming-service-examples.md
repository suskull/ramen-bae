# 🎬 Movie Streaming Service: JavaScript vs SQL Examples

Building on our [normalized database design](../theory/normalization-exercise.md), let's see how real streaming service operations would work in JavaScript vs SQL.

---

## 🎯 **Database Design Challenge: Movie Streaming Service**

Let's start by solving the bonus challenge from our [normalization exercise](../theory/normalization-exercise.md) - designing a database for a movie streaming service with proper normalization.

### **Requirements Analysis**
We need to support:
- **Users** who can have **multiple subscription plans**
- **Movies** that belong to **multiple genres** 
- **User ratings and reviews**
- **Watch history with timestamps**

### **Step 1: Entity Identification**

**Main Entities:**
1. **Users** - customers of the streaming service
2. **Subscription Plans** - different tiers (Basic, Premium, etc.)
3. **Movies** - the content library
4. **Genres** - movie categories
5. **Ratings/Reviews** - user feedback
6. **Watch History** - viewing records

**Relationships:**
- Users ↔ Subscription Plans (Many-to-Many)
- Movies ↔ Genres (Many-to-Many)
- Users → Ratings (One-to-Many)
- Users ↔ Movies (Many-to-Many via Watch History)

### **Step 2: Normalized Database Design**

```sql
-- 1. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Subscription plans
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- 'Basic', 'Premium', 'Family'
    description TEXT,
    monthly_price DECIMAL(8,2) NOT NULL,
    max_streams INTEGER NOT NULL,         -- concurrent streams allowed
    supports_4k BOOLEAN DEFAULT FALSE,
    supports_offline BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. User subscriptions (junction table with additional data)
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE,                        -- NULL for active subscriptions
    is_active BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),           -- 'credit_card', 'paypal', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Genres
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,    -- 'Action', 'Comedy', 'Drama'
    description TEXT
);

-- 5. Movies
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INTEGER,
    duration_minutes INTEGER,
    rating VARCHAR(10),                   -- 'PG', 'PG-13', 'R', etc.
    director VARCHAR(255),
    cast_summary TEXT,                    -- Main actors
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    is_4k_available BOOLEAN DEFAULT FALSE,
    is_offline_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Movie genres (many-to-many junction table)
CREATE TABLE movie_genres (
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- 7. User ratings and reviews
CREATE TABLE movie_ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)             -- One rating per user per movie
);

-- 8. Watch history (many-to-many with rich data)
CREATE TABLE watch_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    watch_duration_minutes INTEGER,       -- How long they actually watched
    completion_percentage DECIMAL(5,2),   -- 0.00 to 100.00
    device_type VARCHAR(50),              -- 'mobile', 'tv', 'web', 'tablet'
    is_completed BOOLEAN DEFAULT FALSE,   -- Did they finish the movie?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_active ON user_subscriptions(user_id, is_active);
CREATE INDEX idx_watch_history_user_date ON watch_history(user_id, started_at);
CREATE INDEX idx_movie_ratings_movie ON movie_ratings(movie_id);
CREATE INDEX idx_movies_genre ON movie_genres(genre_id);
```

### **Step 3: Key Design Decisions**

#### **1. User Subscriptions (Many-to-Many)**
```sql
-- Why junction table instead of direct foreign key?
-- Users might upgrade/downgrade, have subscription history
user_subscriptions (
    user_id,
    plan_id,
    start_date,    -- Track subscription periods
    end_date,      -- NULL for active subscriptions
    is_active      -- Current subscription status
)
```

#### **2. Movie Genres (Many-to-Many)**
```sql
-- Movies can have multiple genres
-- "Inception" = Action + Sci-Fi + Drama
movie_genres (
    movie_id,
    genre_id
)
```

#### **3. Rich Watch History**
```sql
-- Not just "did they watch it?" but detailed viewing analytics
watch_history (
    completion_percentage,  -- How much did they watch?
    device_type,           -- Where did they watch?
    watch_duration_minutes -- Actual vs. movie duration
)
```

#### **4. One Rating Per User Per Movie**
```sql
-- Prevent duplicate ratings with unique constraint
UNIQUE(user_id, movie_id)
```

### **Step 4: Sample Data**

```sql
-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, monthly_price, max_streams, supports_4k, supports_offline) VALUES
('Basic', 'Standard definition, 1 stream', 8.99, 1, FALSE, FALSE),
('Standard', 'HD quality, 2 streams', 13.99, 2, FALSE, TRUE),
('Premium', '4K + HDR, 4 streams', 17.99, 4, TRUE, TRUE);

-- Insert genres
INSERT INTO genres (name, description) VALUES
('Action', 'High-energy movies with thrilling sequences'),
('Comedy', 'Movies designed to make you laugh'),
('Drama', 'Serious, plot-driven movies'),
('Sci-Fi', 'Science fiction and futuristic themes'),
('Horror', 'Scary and suspenseful movies');

-- Insert sample users
INSERT INTO users (email, username, first_name, last_name, date_of_birth) VALUES
('john@example.com', 'johndoe', 'John', 'Doe', '1990-05-15'),
('jane@example.com', 'janesmith', 'Jane', 'Smith', '1985-08-22'),
('mike@example.com', 'mikejones', 'Mike', 'Jones', '1992-03-10');

-- Insert movies
INSERT INTO movies (title, description, release_year, duration_minutes, rating, director, is_4k_available) VALUES
('The Matrix', 'A computer hacker learns reality is a simulation', 1999, 136, 'R', 'The Wachowskis', TRUE),
('Finding Nemo', 'A clownfish searches for his missing son', 2003, 100, 'G', 'Andrew Stanton', TRUE),
('Inception', 'A thief enters peoples dreams to steal secrets', 2010, 148, 'PG-13', 'Christopher Nolan', TRUE);

-- Link movies to genres
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1), (1, 4),  -- The Matrix: Action + Sci-Fi
(2, 2),          -- Finding Nemo: Comedy
(3, 1), (3, 4);  -- Inception: Action + Sci-Fi

-- User subscriptions
INSERT INTO user_subscriptions (user_id, plan_id, start_date, payment_method) VALUES
(1, 3, '2024-01-15', 'credit_card'),  -- John has Premium
(2, 2, '2024-02-01', 'paypal'),       -- Jane has Standard
(3, 1, '2024-03-10', 'credit_card');  -- Mike has Basic

-- Sample ratings
INSERT INTO movie_ratings (user_id, movie_id, rating, review_text) VALUES
(1, 1, 5, 'Mind-blowing movie! Changed how I think about reality.'),
(1, 3, 4, 'Complex but amazing. Had to watch twice to understand it.'),
(2, 2, 5, 'Perfect family movie. Kids loved it!'),
(3, 1, 3, 'Good effects but story was confusing.');

-- Watch history
INSERT INTO watch_history (user_id, movie_id, started_at, ended_at, watch_duration_minutes, completion_percentage, device_type, is_completed) VALUES
(1, 1, '2024-12-01 20:00:00', '2024-12-01 22:16:00', 136, 100.00, 'tv', TRUE),
(1, 3, '2024-12-02 19:30:00', '2024-12-02 21:15:00', 105, 70.95, 'web', FALSE),
(2, 2, '2024-12-03 15:00:00', '2024-12-03 16:40:00', 100, 100.00, 'tablet', TRUE),
(3, 1, '2024-12-04 21:00:00', '2024-12-04 21:45:00', 45, 33.09, 'mobile', FALSE);
```

### **🎯 Normalization Benefits Achieved**

#### **✅ What We Achieved:**
- **No data duplication** - User info stored once
- **Flexible subscriptions** - Easy to track plan changes
- **Rich analytics** - Detailed viewing patterns
- **Scalable relationships** - Movies can have unlimited genres
- **Data integrity** - Foreign keys prevent orphaned records
- **Historical tracking** - Full audit trail of user activity

#### **🚀 Real-World Ready:**
- **Performance optimized** with strategic indexes
- **Business intelligence ready** with rich data relationships
- **Compliance friendly** with user data tracking
- **Monetization insights** through viewing analytics

---

## 🧠 **Core Concept: Movie Data Management**

### **JavaScript Arrays (Frontend Approach)**
```javascript
// How you might structure movie data in frontend
const movies = [
  {
    id: 1,
    title: "The Matrix",
    genres: ["Action", "Sci-Fi"],
    director: "The Wachowskis",
    year: 1999,
    duration: 136,
    rating: "R",
    avgRating: 4.5,
    reviews: [
      { userId: 1, rating: 5, comment: "Mind-blowing!" },
      { userId: 2, rating: 4, comment: "Great effects" }
    ],
    watchHistory: [
      { userId: 1, watchedAt: "2024-12-01T20:00:00Z", completed: true },
      { userId: 2, watchedAt: "2024-12-02T19:30:00Z", completed: false }
    ]
  }
];

const users = [
  {
    id: 1,
    username: "johndoe",
    subscription: { plan: "Premium", active: true },
    watchHistory: [...],
    ratings: [...]
  }
];
```

### **SQL Tables (Database Approach)**
```sql
-- Normalized, efficient storage
SELECT 
    m.title,
    ARRAY_AGG(g.name) as genres,
    m.director,
    AVG(mr.rating) as avg_rating
FROM movies m
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
LEFT JOIN movie_ratings mr ON m.id = mr.movie_id
GROUP BY m.id, m.title, m.director;
```

---

## 🔍 **Streaming Service CRUD Operations**

### **1. Browse Movies (READ Operations)**

#### **JavaScript Filtering (Frontend)**
```javascript
// GET /movies?genre=Action&year=2020&minRating=4
app.get('/movies', (req, res) => {
  let filtered = movies;
  
  // Filter by genre
  if (req.query.genre) {
    filtered = filtered.filter(movie => 
      movie.genres.includes(req.query.genre)
    );
  }
  
  // Filter by year
  if (req.query.year) {
    filtered = filtered.filter(movie => 
      movie.year >= parseInt(req.query.year)
    );
  }
  
  // Filter by rating
  if (req.query.minRating) {
    filtered = filtered.filter(movie => 
      movie.avgRating >= parseFloat(req.query.minRating)
    );
  }
  
  // Sort and paginate
  const sorted = filtered.sort((a, b) => b.avgRating - a.avgRating);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  
  res.json({
    movies: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    totalPages: Math.ceil(sorted.length / limit)
  });
});
```

#### **SQL Equivalent (Database)**
```sql
-- Much more efficient for large datasets!
SELECT 
    m.id,
    m.title,
    m.release_year,
    m.duration_minutes,
    m.director,
    AVG(mr.rating) as avg_rating,
    COUNT(mr.rating) as review_count,
    ARRAY_AGG(DISTINCT g.name) as genres
FROM movies m
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
LEFT JOIN movie_ratings mr ON m.id = mr.movie_id
WHERE m.is_active = TRUE
  AND ($1::VARCHAR IS NULL OR g.name = $1)  -- genre filter
  AND ($2::INTEGER IS NULL OR m.release_year >= $2)  -- year filter
  AND m.id IN (
    SELECT movie_id FROM movie_ratings 
    GROUP BY movie_id 
    HAVING AVG(rating) >= COALESCE($3, 0)  -- rating filter
  )
GROUP BY m.id, m.title, m.release_year, m.duration_minutes, m.director
ORDER BY avg_rating DESC NULLS LAST
LIMIT $4 OFFSET $5;  -- pagination

-- Parameters: [genre, year, minRating, limit, offset]
```

### **2. User Recommendations (Complex Logic)**

#### **JavaScript Approach (Expensive)**
```javascript
// GET /users/:id/recommendations
app.get('/users/:id/recommendations', async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  // Get user's watch history
  const watchedMovieIds = user.watchHistory.map(w => w.movieId);
  
  // Get user's favorite genres (from ratings)
  const userRatings = user.ratings || [];
  const genrePreferences = {};
  
  userRatings.forEach(rating => {
    const movie = movies.find(m => m.id === rating.movieId);
    if (rating.rating >= 4 && movie) {
      movie.genres.forEach(genre => {
        genrePreferences[genre] = (genrePreferences[genre] || 0) + 1;
      });
    }
  });
  
  // Find similar users
  const similarUsers = users.filter(u => {
    if (u.id === userId) return false;
    
    // Check for common highly rated movies
    const commonMovies = u.ratings.filter(r => 
      userRatings.some(ur => ur.movieId === r.movieId && ur.rating >= 4 && r.rating >= 4)
    );
    
    return commonMovies.length >= 2;
  });
  
  // Get recommendations from similar users
  const recommendations = [];
  similarUsers.forEach(similarUser => {
    similarUser.ratings
      .filter(r => r.rating >= 4 && !watchedMovieIds.includes(r.movieId))
      .forEach(r => {
        const movie = movies.find(m => m.id === r.movieId);
        if (movie) {
          recommendations.push({
            ...movie,
            recommendationScore: r.rating * 0.7 + (movie.avgRating * 0.3)
          });
        }
      });
  });
  
  // Remove duplicates and sort
  const uniqueRecs = recommendations.reduce((acc, movie) => {
    const existing = acc.find(m => m.id === movie.id);
    if (!existing || existing.recommendationScore < movie.recommendationScore) {
      acc = acc.filter(m => m.id !== movie.id);
      acc.push(movie);
    }
    return acc;
  }, []);
  
  res.json(uniqueRecs.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 10));
});
```

#### **SQL Approach (Efficient)**
```sql
-- Get personalized recommendations using collaborative filtering
WITH user_preferences AS (
  -- Get user's favorite genres
  SELECT 
    g.id as genre_id,
    COUNT(*) as preference_score
  FROM movie_ratings mr
  JOIN movies m ON mr.movie_id = m.id
  JOIN movie_genres mg ON m.id = mg.movie_id
  JOIN genres g ON mg.genre_id = g.id
  WHERE mr.user_id = $1 AND mr.rating >= 4
  GROUP BY g.id
),
similar_users AS (
  -- Find users with similar taste
  SELECT 
    mr2.user_id,
    COUNT(*) as common_movies,
    AVG(ABS(mr1.rating - mr2.rating)) as rating_distance
  FROM movie_ratings mr1
  JOIN movie_ratings mr2 ON mr1.movie_id = mr2.movie_id
  WHERE mr1.user_id = $1 
    AND mr2.user_id != $1
    AND mr1.rating >= 4 
    AND mr2.rating >= 4
  GROUP BY mr2.user_id
  HAVING COUNT(*) >= 2  -- At least 2 movies in common
  ORDER BY common_movies DESC, rating_distance ASC
  LIMIT 20
),
candidate_movies AS (
  -- Get highly rated movies from similar users
  SELECT 
    m.id,
    m.title,
    AVG(mr.rating) as similar_user_rating,
    COUNT(mr.rating) as similar_user_votes
  FROM similar_users su
  JOIN movie_ratings mr ON su.user_id = mr.user_id
  JOIN movies m ON mr.movie_id = m.id
  WHERE mr.rating >= 4
    AND m.id NOT IN (
      -- Exclude already watched movies
      SELECT movie_id FROM watch_history WHERE user_id = $1
    )
  GROUP BY m.id, m.title
  HAVING COUNT(mr.rating) >= 2
)
SELECT 
  cm.id,
  cm.title,
  cm.similar_user_rating,
  AVG(mr_all.rating) as overall_rating,
  -- Boost score for preferred genres
  cm.similar_user_rating * 0.6 + 
  AVG(mr_all.rating) * 0.3 + 
  COALESCE(up.preference_score * 0.1, 0) as recommendation_score
FROM candidate_movies cm
LEFT JOIN movie_ratings mr_all ON cm.id = mr_all.movie_id
LEFT JOIN movie_genres mg ON cm.id = mg.movie_id
LEFT JOIN user_preferences up ON mg.genre_id = up.genre_id
GROUP BY cm.id, cm.title, cm.similar_user_rating, up.preference_score
ORDER BY recommendation_score DESC
LIMIT 10;
```

### **Powerful Queries You Can Now Run**

```sql
-- 1. Find users who haven't finished watching action movies
SELECT DISTINCT 
    u.username,
    m.title,
    wh.completion_percentage
FROM users u
JOIN watch_history wh ON u.id = wh.user_id
JOIN movies m ON wh.movie_id = m.id
JOIN movie_genres mg ON m.id = mg.movie_id
JOIN genres g ON mg.genre_id = g.id
WHERE g.name = 'Action' 
  AND wh.completion_percentage < 100;

-- 2. Get average rating by genre
SELECT 
    g.name as genre,
    AVG(mr.rating) as avg_rating,
    COUNT(mr.rating) as total_ratings
FROM genres g
JOIN movie_genres mg ON g.id = mg.genre_id
JOIN movie_ratings mr ON mg.movie_id = mr.movie_id
GROUP BY g.id, g.name
ORDER BY avg_rating DESC;

-- 3. Find most binge-watched movies (multiple sessions)
SELECT 
    m.title,
    COUNT(wh.id) as total_sessions,
    COUNT(DISTINCT wh.user_id) as unique_viewers
FROM movies m
JOIN watch_history wh ON m.id = wh.movie_id
GROUP BY m.id, m.title
HAVING COUNT(wh.id) > 1
ORDER BY total_sessions DESC;

-- 4. Premium subscribers who watch on mobile (upsell opportunity)
SELECT 
    u.username,
    sp.name as current_plan,
    COUNT(wh.id) as mobile_sessions
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN watch_history wh ON u.id = wh.user_id
WHERE us.is_active = TRUE 
  AND wh.device_type = 'mobile'
  AND sp.name = 'Premium'
GROUP BY u.id, u.username, sp.name;
```

### **3. Add Movie Rating (CREATE)**

#### **JavaScript Approach**
```javascript
// POST /movies/:movieId/ratings
app.post('/movies/:movieId/ratings', (req, res) => {
  const movieId = parseInt(req.params.movieId);
  const { userId, rating, reviewText } = req.body;
  
  // Validate movie exists
  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  // Check if user already rated this movie
  const existingRatingIndex = movie.reviews.findIndex(r => r.userId === userId);
  
  const newRating = {
    id: Date.now(),
    userId,
    rating,
    comment: reviewText,
    createdAt: new Date().toISOString()
  };
  
  if (existingRatingIndex >= 0) {
    // Update existing rating
    movie.reviews[existingRatingIndex] = { ...movie.reviews[existingRatingIndex], ...newRating };
  } else {
    // Add new rating
    movie.reviews.push(newRating);
  }
  
  // Recalculate average rating
  const totalRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0);
  movie.avgRating = totalRating / movie.reviews.length;
  
  res.status(201).json(newRating);
});
```

#### **SQL Approach**
```sql
-- Insert or update rating (PostgreSQL UPSERT)
INSERT INTO movie_ratings (user_id, movie_id, rating, review_text, created_at)
VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, movie_id) 
DO UPDATE SET 
  rating = EXCLUDED.rating,
  review_text = EXCLUDED.review_text,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- Average rating is calculated on-the-fly in queries, no need to store!
```

### **4. Track Watch History (CREATE)**

#### **JavaScript Approach**
```javascript
// POST /watch-history
app.post('/watch-history', (req, res) => {
  const { userId, movieId, startedAt, endedAt, deviceType } = req.body;
  
  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  const watchDuration = endedAt ? 
    (new Date(endedAt) - new Date(startedAt)) / (1000 * 60) : // minutes
    null;
  
  const completionPercentage = watchDuration ? 
    Math.min((watchDuration / movie.duration) * 100, 100) : 
    0;
  
  const watchRecord = {
    id: Date.now(),
    userId,
    movieId,
    startedAt,
    endedAt,
    watchDuration,
    completionPercentage,
    deviceType,
    isCompleted: completionPercentage >= 90,
    createdAt: new Date().toISOString()
  };
  
  // Add to user's watch history
  const user = users.find(u => u.id === userId);
  if (!user.watchHistory) user.watchHistory = [];
  user.watchHistory.push(watchRecord);
  
  // Add to movie's watch history
  if (!movie.watchHistory) movie.watchHistory = [];
  movie.watchHistory.push(watchRecord);
  
  res.status(201).json(watchRecord);
});
```

#### **SQL Approach**
```sql
-- Insert watch history record
INSERT INTO watch_history (
  user_id, 
  movie_id, 
  started_at, 
  ended_at, 
  watch_duration_minutes, 
  completion_percentage, 
  device_type, 
  is_completed
) VALUES (
  $1, 
  $2, 
  $3, 
  $4, 
  EXTRACT(EPOCH FROM ($4::TIMESTAMP - $3::TIMESTAMP)) / 60,  -- Calculate duration
  LEAST(
    (EXTRACT(EPOCH FROM ($4::TIMESTAMP - $3::TIMESTAMP)) / 60) / 
    (SELECT duration_minutes FROM movies WHERE id = $2) * 100, 
    100
  ),  -- Calculate completion percentage
  $5,
  CASE 
    WHEN (EXTRACT(EPOCH FROM ($4::TIMESTAMP - $3::TIMESTAMP)) / 60) / 
         (SELECT duration_minutes FROM movies WHERE id = $2) * 100 >= 90 
    THEN TRUE 
    ELSE FALSE 
  END
) RETURNING *;
```

---

## 📊 **Analytics & Reporting**

### **JavaScript Aggregation (Memory Intensive)**
```javascript
// GET /analytics/popular-genres
app.get('/analytics/popular-genres', (req, res) => {
  const genreStats = {};
  
  // Calculate from all watch history
  users.forEach(user => {
    if (user.watchHistory) {
      user.watchHistory.forEach(watch => {
        const movie = movies.find(m => m.id === watch.movieId);
        if (movie && watch.isCompleted) {
          movie.genres.forEach(genre => {
            if (!genreStats[genre]) {
              genreStats[genre] = {
                name: genre,
                totalWatches: 0,
                uniqueViewers: new Set(),
                totalWatchTime: 0
              };
            }
            genreStats[genre].totalWatches++;
            genreStats[genre].uniqueViewers.add(user.id);
            genreStats[genre].totalWatchTime += (watch.watchDuration || 0);
          });
        }
      });
    }
  });
  
  // Convert Sets to counts and format
  const result = Object.values(genreStats).map(stat => ({
    name: stat.name,
    totalWatches: stat.totalWatches,
    uniqueViewers: stat.uniqueViewers.size,
    avgWatchTime: stat.totalWatchTime / stat.totalWatches,
    popularity: stat.totalWatches * 0.6 + stat.uniqueViewers.size * 0.4
  })).sort((a, b) => b.popularity - a.popularity);
  
  res.json(result);
});
```

### **SQL Aggregation (Efficient)**
```sql
-- Popular genres analytics
SELECT 
  g.name,
  COUNT(wh.id) as total_watches,
  COUNT(DISTINCT wh.user_id) as unique_viewers,
  AVG(wh.watch_duration_minutes) as avg_watch_time,
  -- Popularity score combining views and unique viewers
  COUNT(wh.id) * 0.6 + COUNT(DISTINCT wh.user_id) * 0.4 as popularity_score
FROM genres g
JOIN movie_genres mg ON g.id = mg.genre_id
JOIN movies m ON mg.movie_id = m.id
JOIN watch_history wh ON m.id = wh.movie_id
WHERE wh.is_completed = TRUE
  AND wh.started_at >= CURRENT_DATE - INTERVAL '30 days'  -- Last 30 days
GROUP BY g.id, g.name
ORDER BY popularity_score DESC;
```

---

## 🚀 **Performance Comparison**

### **JavaScript Limitations**
```javascript
// This becomes SLOW with large datasets
const findRecommendations = (userId) => {
  // O(n²) complexity - gets exponentially slower
  const allRatings = users.flatMap(u => u.ratings || []); // 100K+ operations
  const userRatings = allRatings.filter(r => r.userId === userId);
  
  // Multiple nested loops = performance nightmare
  users.forEach(user => {
    user.ratings.forEach(rating => {
      movies.forEach(movie => {
        // This runs millions of times!
      });
    });
  });
};

// Memory usage grows linearly with data
const allData = {
  users: [...], // 50MB
  movies: [...], // 20MB  
  watchHistory: [...], // 200MB
  ratings: [...] // 100MB
}; // Total: 370MB+ in memory
```

### **SQL Advantages**
```sql
-- Optimized with indexes - O(log n) complexity
CREATE INDEX idx_movie_ratings_user_rating ON movie_ratings(user_id, rating);
CREATE INDEX idx_watch_history_user_date ON watch_history(user_id, started_at);
CREATE INDEX idx_movie_genres_genre ON movie_genres(genre_id);

-- Only loads what you need
SELECT * FROM movies 
WHERE id IN (
  SELECT DISTINCT movie_id 
  FROM movie_ratings 
  WHERE user_id = 123 AND rating >= 4
) 
LIMIT 10; -- Only 10 records in memory

-- Database handles complex operations efficiently
```

---

## 🎯 **When to Use What**

### **JavaScript/Frontend (Good For)**
- ✅ **Real-time UI updates** (like progress bars)
- ✅ **Small datasets** (< 1000 records)
- ✅ **Complex business logic** (recommendation algorithms)
- ✅ **User interface calculations** (formatting, display logic)

```javascript
// Good: UI-specific logic
const formatWatchTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const updateProgressBar = (currentTime, totalTime) => {
  const percentage = (currentTime / totalTime) * 100;
  document.getElementById('progress').style.width = `${percentage}%`;
};
```

### **SQL Database (Good For)**
- ✅ **Large datasets** (10K+ records)
- ✅ **Data persistence** and integrity
- ✅ **Complex relationships** and joins
- ✅ **Analytics and reporting**
- ✅ **Concurrent user access**

```sql
-- Good: Large-scale data operations
-- Find trending movies across 1M+ users
SELECT 
  m.title,
  COUNT(DISTINCT wh.user_id) as unique_viewers_today,
  AVG(mr.rating) as avg_rating
FROM movies m
JOIN watch_history wh ON m.id = wh.movie_id
LEFT JOIN movie_ratings mr ON m.id = mr.movie_id
WHERE wh.started_at >= CURRENT_DATE
GROUP BY m.id, m.title
HAVING COUNT(DISTINCT wh.user_id) > 100
ORDER BY unique_viewers_today DESC;
```

---

## 💡 **Key Takeaways**

1. **SQL is like array methods for massive datasets** - same concepts, better performance
2. **Normalization prevents the nested object complexity** you'd have in JavaScript
3. **Database relationships are more powerful than object references**
4. **SQL aggregations are infinitely more efficient** than JavaScript reduce operations
5. **Foreign keys prevent bugs** you'd have to manually check in JavaScript

---

## 🎬 **Real-World Architecture**

```
Frontend (React/Vue)     API Layer (Node.js)     Database (PostgreSQL)
─────────────────────    ─────────────────────   ─────────────────────
• UI components          • Route handlers        • Normalized tables
• State management       • Business logic        • Efficient queries  
• User interactions      • Authentication        • Data integrity
• Real-time updates      • API responses         • Concurrent access
                                                • Analytics
```

**Each layer does what it's best at:**
- **Frontend**: User experience and real-time interactions
- **API**: Business logic and data transformation  
- **Database**: Efficient data storage, retrieval, and relationships

Your streaming service is now ready to handle Netflix-scale data! 🚀 