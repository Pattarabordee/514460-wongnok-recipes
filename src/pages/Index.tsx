
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import SearchSidebar from "@/components/SearchSidebar";
import RecipeList from "@/components/RecipeList";

const Index = () => (
  <Layout>
    <Hero />
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
      <div className="lg:w-1/3 xl:w-1/4">
        <SearchSidebar />
      </div>
      <div className="flex-1">
        <RecipeList />
      </div>
    </div>
  </Layout>
);

export default Index;
