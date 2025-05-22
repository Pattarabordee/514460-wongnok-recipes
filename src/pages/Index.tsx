// Home page for Wongnok recipes

import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import SearchSidebar from "@/components/SearchSidebar";
import RecipeList from "@/components/RecipeList";
import HomeRecipesTabs from "@/components/HomeRecipesTabs";

const Index = () => (
  <Layout>
    <Hero />
    <div className="mb-10">
      <HomeRecipesTabs />
    </div>
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <SearchSidebar />
      </div>
      <div className="flex-1">
        <RecipeList />
      </div>
    </div>
  </Layout>
);

export default Index;
