
const Hero = () => (
  <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-100 to-yellow-50 rounded-lg mb-10 shadow">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-emerald-700 animate-fade-in">Wongnok recipes</h1>
      <p className="text-lg md:text-2xl text-gray-700 mb-8 animate-fade-in">
        ค้นพบ แบ่งปัน และให้คะแนนสูตรอาหารโฮมเมดแสนอร่อยจากเชฟทั่วโลก ร่วมเป็นส่วนหนึ่งของชุมชน Wongnok recipes วันนี้!
      </p>
      <a
        href="#"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg hover-scale"
      >
        แชร์สูตรอาหารของคุณ
      </a>
    </div>
  </section>
);

export default Hero;
