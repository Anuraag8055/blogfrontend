// src/pages/PublicSite.js

import React, { useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "components/misc/Headings";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { useParams } from "react-router-dom";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const Heading = tw(SectionHeading)`text-gray-900 mb-4`;

const Text = styled.div`
  ${tw`text-lg text-gray-800`}
  p { ${tw`mt-2 leading-loose`} }
  h1 { ${tw`text-3xl font-bold mt-10`} }
  h2 { ${tw`text-2xl font-bold mt-8`} }
  h3 { ${tw`text-xl font-bold mt-6`} }
  ul {
    ${tw`list-disc list-inside`}
    li {
      ${tw`ml-2 mb-3`}
      p { ${tw`mt-0 inline leading-normal`} }
    }
  }
`;

export default function PublicSite() {
  const { slug } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/sites?filters[slug][$eq]=${slug}`
        );
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setSite(json.data[0]);
        }
      } catch (err) {
        console.error("Error loading site:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!site) return <p>Site not found</p>;

  const { title, body } = site.content;

  return (
    <AnimationRevealPage>
      <Header disableLogoLink={true} />
      <Container>
        <ContentWithPaddingXl>
          <Heading>{title}</Heading>
          <Text>
            <ReactMarkdown>{body}</ReactMarkdown>
          </Text>
        </ContentWithPaddingXl>
      </Container>
      <Footer />
    </AnimationRevealPage>
  );
}
