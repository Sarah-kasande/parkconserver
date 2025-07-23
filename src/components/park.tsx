import React from 'react';

export default function NationalPark() {
  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">The Last Eden of Africa</h1>
      <p className="text-gray-700 mb-4">
      The first wildlife reserves in Rwanda were established in the early 1930s, but it wasn’t until 1934 that the country’s oldest national park, Volcanoes National Park, was officially gazetted. Since then, Rwanda has expanded its conservation efforts, with protected areas like Akagera and Nyungwe National Parks now forming a vital network of biodiversity sanctuaries that cover a significant portion of the nation's natural heritage.
      </p>
      <p className="text-gray-700 mb-4">
        Akagera National Park diverse wildlife lives virtually undisturbed by human activity, with virtually all the area’s human population living outside the park on the opposite bank of the Ngove Lagoon. What limited agriculture there is here is of the slash-and-burn variety, and tourism is carefully managed along ‘tourism-pays-for-conservation’ principles.
      </p>
      <p className="text-gray-700 mb-4">
        The range of wildlife in Akagera – terrestrial, avian – is extraordinary. Famously, the park offers the opportunity to observe wildlife including gorilla, leopard, hippo, and elephant crossing its expansive white sand beaches and enjoying the surf. 
      </p>
      <p className="text-gray-700">
        More than 60 miles of uninhabited coastline make Akagera ideal for the observation of humpback and killer whales, dolphin, tarpon, and a number of other large saltwater fish.
      </p>
    </div>
    <div className="space-y-4">
      <img src="/lovable-uploads/pexels-mikesingapore-2274018.jpg" alt="Elephants in a field" width={400} height={250} className="rounded-lg" />
      <img src="/lovable-uploads/pexels-git-stephen-gitau-302905-1670732.jpg" alt="Elephant on the beach" width={400} height={250} className="rounded-lg" />
    </div>
  </div>
  );
}
