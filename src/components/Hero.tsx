
const Hero = () => (
  <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-100 to-yellow-50 rounded-lg mb-10 shadow">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-emerald-700 animate-fade-in">Wongnok recipes</h1>
      <p className="text-lg md:text-2xl text-gray-700 mb-8 animate-fade-in">
        Discover, share, and rate amazing home-cooked recipes from cooks around the world. Join the Wongnok community today!
      </p>
      <a
        href="#"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg hover-scale"
      >
        Share your recipe
      </a>
    </div>
  </section>
);

export default Hero;
