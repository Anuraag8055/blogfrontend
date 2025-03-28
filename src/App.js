import "tailwindcss/dist/base.css";
import "styles/globalStyles.css";
import React from "react";
// import { css } from "styled-components/macro"; //eslint-disable-line

import BlogIndex from "pages/BlogIndex";
 import Blog from "pages/Blog.js";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import useFetch from "hooks/useFetch";

export default function App() {
 
  const {loading,error,data} = useFetch('https://strapibackend-41l3.onrender.com/api/blogs?populate=*');
  if(loading) return <p>Loading...</p>
  if(error) return console.log(error)


  return (
    <Router>
      <Switch>

      <Route path="/blog/:id">
          <Blog posts={data}/>
        </Route>

        <Route path="/">
          <BlogIndex posts={data} />
        </Route>

      </Switch>
    </Router>
  );
}
