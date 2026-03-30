import { Carousel } from 'react-bootstrap';
import ExampleCarouselImage from '../Components/carouselImg';

function CarouselImg() {
  return (
    <Carousel>
      <Carousel.Item>
        <ExampleCarouselImage/>
        <Carousel.Caption>
          <h3>Apprenez, découvrez, restez curieux !</h3>
          <p>Les derniers articles juste en dessous</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <ExampleCarouselImage/>
        <Carousel.Caption>
          <h3>Une passion ?</h3>
          <p>Découvrez nos nouveaux articles</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <ExampleCarouselImage/>
        <Carousel.Caption>
          <h3>Une idée ?</h3>
          <p>
            Et si vous vous penchiez sur votre prochaine passion
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselImg;