import Image from 'react-bootstrap/Image';



function ExampleCarouselImage() {

    const mapImg = [
        "https://i.pinimg.com/736x/94/33/c5/9433c505b243e43bcd8ba3f462abcc10.jpg",
        "https://i.pinimg.com/1200x/a3/e6/65/a3e665a8eee6cfe42a4007dfff3da301.jpg",
        "https://i.pinimg.com/1200x/47/4f/b4/474fb482fc29166fd54c3da3332da0b2.jpg",
        "https://i.pinimg.com/1200x/7e/3f/e9/7e3fe9417fabc059391e09bb1f0b9c77.jpg",
        "https://i.pinimg.com/736x/9b/19/b6/9b19b6069c9ba927afbb95b349286cc9.jpg"

    ]
function ImgRandom() {
    let nbRand: number = Math.floor(Math.random() * mapImg.length);
    return (
        <Image 
            src={mapImg[nbRand]} 
            className='card-caroussel'
                        alt="photo de présentations"

            style={{ height: '300px', objectFit: 'cover', width: '100%' }}
            fluid 
        />
    )      
}

return (
    <div className="card">
        <ImgRandom />
    </div>
);
}

export default ExampleCarouselImage;