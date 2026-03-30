import { Carousel } from 'react-bootstrap';
import { redirect } from 'react-router-dom';

function CarouselBooks({ books }) {
  if (!books.length) return null

  return (
    <div className="carousel-wrapper">
      <Carousel className="carousel-books">
        {books.map((book, index) => (

          <Carousel.Item key={index}>
          <a href={book.url} target="_blank" rel="noreferrer">

            <div className="carousel-card" >
              <img src={book.cover} alt={book.title} />
              
              <div className="carousel-content">
                <h5>{book.title}</h5>
                <p>{book.description?.slice(0, 100)}...</p>
              </div>
            </div>
          </a>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default CarouselBooks;