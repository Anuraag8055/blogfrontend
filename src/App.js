import "tailwindcss/dist/base.css";
import "styles/globalStyles.css";
import React from "react";
import BlogIndex from "pages/BlogIndex";
import Blog from "pages/Blog.js";
import PublicSite from "pages/PublicSite"; 
import NotFoundPage from "pages/NotFoundPage"; // Add this
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import useFetch from "hooks/useFetch";

export default function App() {
  const { loading, error, data } = useFetch(`${process.env.REACT_APP_API_URL}/api/blogs/?populate=*`);
  if (loading) return <p>Loading...</p>;
  if (error) return console.log(error);

  return (
    <Router>
      <Switch>
        <Route path="/blog/:id">
          <Blog posts={data} />
        </Route>
        <Route path="/sites/:slug">
          <PublicSite />
        </Route>

        <Route exact path="/">
          <BlogIndex posts={data} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Router>
  );
}
