import { Carousel } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { fetchWithAuth } from '../Services/apiClient';

function CarouselBooks({ books }) {
  const { token } = useAuth();
  const [likedBooks, setLikedBooks] = useState(new Set());

  useEffect(() => {
    checkLikedBooks();
  }, [books]);

  const checkLikedBooks = async () => {
    const likes = new Set();
    for (const book of books) {
      if (book.id) {
        try {
          const response = await fetchWithAuth(`/likes/status?contentId=${book.id}&contentType=book`);
          if (response.ok) {
            const data = await response.json();
            if (data.liked) {
              likes.add(book.id);
            }
          }
        } catch (error) {
          console.error('Error checking like status for book:', error);
        }
      }
    }
    setLikedBooks(likes);
  };

  const toggleLike = async (book) => {
    try {
      const response = await fetchWithAuth('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({ contentId: book.id, contentType: 'book' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      setLikedBooks(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(book.id);
        } else {
          newSet.delete(book.id);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!books.length) return null

  return (
    <div className="carousel-wrapper">
      <Carousel className="carousel-books">
        {books.map((book, index) => (
          <Carousel.Item key={index}>
            <a href={book.url} target="_blank" rel="noreferrer">
              <div className="carousel-card">
                <img src={book.cover} alt={book.title} />
                <div className="carousel-content">
                  <h5>{book.title}</h5>
                  <p>{book.description?.slice(0, 100)}...</p>
                </div>
                {book.id && (
                  <button
                    className={`likes ${likedBooks.has(book.id) ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(book);
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255,255,255,0.8)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                    aria-label={likedBooks.has(book.id) ? `Retirer "${book.title}" des favoris` : `Ajouter "${book.title}" aux favoris`}
                  >
                    {likedBooks.has(book.id) ? '♥' : '♡'}
                  </button>
                )}
              </div>
            </a>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default CarouselBooks;