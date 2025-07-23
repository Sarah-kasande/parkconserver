
import { TreePine, Heart, Users, DollarSign, FileText } from 'lucide-react';

const features = [
  {
    name: 'Park Tours',
    description: 'Explore our beautiful parks with guided tours led by conservation experts.',
    icon: TreePine,
  },
  {
    name: 'Donations',
    description: 'Support our conservation efforts through donations that directly fund park maintenance and wildlife protection.',
    icon: Heart,
  },
  {
    name: 'Partnerships',
    description: 'Collaborate with us on conservation projects and initiatives as a corporate or individual partner.',
    icon: Users,
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-conservation-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-conservation-900 sm:text-4xl">
            Our Conservation Mission
          </h2>
          <p className="mt-6 text-lg leading-8 text-conservation-700">
            Dedicated to preserving natural habitats and promoting sustainable interactions with our environment.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="feature-card">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-conservation-100">
                  <feature.icon className="h-6 w-6 text-conservation-600" aria-hidden="true" />
                </div>
                <dt className="text-xl font-semibold leading-7 text-conservation-900">
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-conservation-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;
