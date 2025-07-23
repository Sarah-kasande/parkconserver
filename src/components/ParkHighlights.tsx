
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const parks = [
  {
    id: 1,
    name: 'Volcanoes National Park',
    description: 'Home to mountain gorillas, scenic volcanic landscapes, and rich biodiversity.',
    image: '/lovable-uploads/pexels-elena-blessing-355784-2674050.jpg',
  },
  {
    id: 2,
    name: 'Nyungwe National Park',
    description: 'A lush rainforest offering canopy walks, chimpanzee trekking, and birdwatching.',
    image: '/lovable-uploads/pexels-freestockpro-321525.jpg',
  },
  {
    id: 3,
    name: 'Akagera National Park',
    description: 'A savannah paradise with the Big Five, vast lakes, and scenic plains.',
    image: '/lovable-uploads/pexels-pixabay-55814.jpg',
  },
  {
    id: 4,
    name: 'Gishwati-Mukura National Park',
    description: 'A lush rainforest offering canopy walks, chimpanzee trekking, and birdwatching.',
    image: '/lovable-uploads/pexels-freestockpro-321525.jpg',
  },
];


const ParkHighlights = () => {
  return (
    <div className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-conservation-900 sm:text-4xl">
            Explore Other Parks
          </h2>
          <p className="mt-6 text-lg leading-8 text-conservation-700">
            Discover the natural beauty and biodiversity of our conservation areas.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {parks.map((park) => (
            <div key={park.id} className="overflow-hidden rounded-lg shadow-lg border border-conservation-100 hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={park.image}
                  alt={park.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-conservation-900">{park.name}</h3>
                <p className="mt-2 text-conservation-600">{park.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Button asChild variant="outline" className="text-conservation-700 border-conservation-300 hover:bg-conservation-50">
                    <Link to={`/parks/${park.id}`}>
                      Learn More
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="bg-conservation-600 hover:bg-conservation-700">
                    <Link to={`/book-tour?park=${park.id}`}>
                      Book Tour
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkHighlights;
