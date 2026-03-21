import { Carousel } from 'react-bootstrap';

function CarouselBooks({ books }) {
  if (!books.length) return null

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
  )
}

export default CarouselBooks;