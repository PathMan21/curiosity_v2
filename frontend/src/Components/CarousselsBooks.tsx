import { Carousel } from 'react-bootstrap';
import { useEffect } from 'react';
import { fetchWithAuth } from '../Services/apiClient';
import { useState } from 'react';

function CarouselBooks() {
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const response = await fetchWithAuth('/data/books', { method: 'GET' });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      setBooks(data.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

return (
  <div className="carousel-wrapper">
    <Carousel className="carousel-books">
      {books.map((book, index) => (
        <Carousel.Item key={index}>
          <div className="carousel-card">
            <img src={book.cover} alt={book.title} />
            <div className="carousel-content">
              <h5>{book.title}</h5>
              <p>{book.description?.slice(0, 100)}...</p>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  </div>
);
}

export default CarouselBooks;