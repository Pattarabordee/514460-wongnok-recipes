
import { useState } from "react";

const difficulties = ["Easy", "Medium", "Hard", "Extreme Hard"];
const times = ["5-10 mins", "11-30 mins", "31-60 mins", "60+ mins"];

interface SearchSidebarProps {
  onSearch?: (params: Record<string, string>) => void;
}

const SearchSidebar = ({ onSearch }: SearchSidebarProps) => {
  const [name, setName] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [cookingTime, setCookingTime] = useState("");

  // Placeholder for logic integration
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ name, ingredient, difficulty, cookingTime });
    }
  };

  return (
    <aside className="mb-8 md:mb-0 md:w-80 bg-white/70 rounded-xl shadow p-6 sticky top-8 animate-fade-in z-20">
      <h2 className="font-semibold text-emerald-700 mb-4 text-lg">Search & Filter</h2>
      <form className="space-y-4" onSubmit={handleSearch}>
        <div>
          <label className="text-sm text-gray-700 mb-1 block" htmlFor="search-name">Recipe Name</label>
          <input id="search-name" type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="e.g. pad thai" />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1 block" htmlFor="search-ingredient">Ingredient</label>
          <input id="search-ingredient" type="text" value={ingredient} onChange={e => setIngredient(e.target.value)}
            className="w-full rounded border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="e.g. chicken" />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1">Difficulty</label>
          <select className="block w-full px-3 py-2 border-gray-200 rounded" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="">Any</option>
            {difficulties.map(df => (
              <option key={df} value={df}>{df}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-1">Cooking Time</label>
          <select className="block w-full px-3 py-2 border-gray-200 rounded" value={cookingTime} onChange={e => setCookingTime(e.target.value)}>
            <option value="">Any</option>
            {times.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded shadow hover-scale transition">Search</button>
      </form>
    </aside>
  );
};

export default SearchSidebar;
