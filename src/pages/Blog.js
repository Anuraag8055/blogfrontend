import React, { useState, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { SectionHeading } from "components/misc/Headings";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { PrimaryButton } from "components/misc/Buttons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeadingRow = tw.div`flex justify-between items-center`;
const Heading = tw(SectionHeading)`text-gray-900 mb-4`;
const Text = styled.div`
  ${tw`text-lg text-gray-800`}
  p {
    ${tw`mt-2 leading-loose`}
  }
  h1 {
    ${tw`text-3xl font-bold mt-10`}
  }
  h2 {
    ${tw`text-2xl font-bold mt-8`}
  }
  h3 {
    ${tw`text-xl font-bold mt-6`}
  }
  ul {
    ${tw`list-disc list-inside`}
    li {
      ${tw`ml-2 mb-3`}
      p {
        ${tw`mt-0 inline leading-normal`}
      }
    }
  }
`;

export default ({ posts }) => {
  const { id } = useParams();
  const [isPublishing, setIsPublishing] = useState(false);
  const [post, setPost] = useState(null);
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [blogName, setBlogName] = useState("");
  const [publishedUrl, setPublishedUrl] = useState(null);

  useEffect(() => {
    const found = posts.data.find((p) => p.id === Number(id));
    setPost(found);
  }, [posts, id]);

  useEffect(() => {
    const checkIfPublished = async () => {
      if (!post) return;

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/sites?populate=*&filters[content][title][$eq]=${encodeURIComponent(
            post.blogTitle
          )}`
        );
        const json = await res.json();
        const match = json.data.find(
          (site) =>
            site.content?.title === post.blogTitle &&
            site.content?.body === post.blogContent &&
            site.published
        );
        setAlreadyPublished(!!match);
      } catch (err) {
        console.error("Error checking if published", err);
      }
    };

    checkIfPublished();
  }, [post]);

  const handlePublishFromModal = async () => {
    if (!blogName) {
      toast.warn("Please enter a blog name.");
      return;
    }

    const slug = blogName.toLowerCase().replace(/\s+/g, "-");

    try {
      setIsPublishing(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            name: blogName,
            slug,
            published: true,
            content: {
              title: post.blogTitle,
              body: post.blogContent,
            },
          },
        }),
      });

      const json = await res.json();
      if (json?.data) {
        const url = `${window.location.origin}/sites/${slug}`;
        setPublishedUrl(url);
        setAlreadyPublished(true);
        setShowPublishModal(false);
      } else {
        toast.error("❌ Failed to publish. Check your Strapi API or permissions.");
      }
    } catch (err) {
      console.error("Publish error", err);
      toast.error("❌ Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!post) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sites?filters[content][title][$eq]=${encodeURIComponent(
          post.blogTitle
        )}`
      );
      const json = await res.json();
      const site = json.data.find(
        (site) =>
          site.content?.title === post.blogTitle &&
          site.content?.body === post.blogContent
      );

      if (!site) {
        return toast.warn("⚠️ No published site found for this blog post!");
      }

      const siteId = site.id;

      const unpublishRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sites/${siteId}`,
        {
          method: "DELETE",
        }
      );

      if (!unpublishRes.ok) throw new Error("Unpublish failed");

      toast.success("✅ Unpublished successfully!");
      setAlreadyPublished(false);
    } catch (err) {
      console.error("Unpublish error", err);
      toast.error("❌ Failed to unpublish");
    }
  };

  return (
    <AnimationRevealPage>
      <ToastContainer />
      {/* Modal to enter blog name */}
      {showPublishModal && (
        <div tw="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div tw="bg-white p-8 rounded shadow-lg w-full max-w-md">
            <h2 tw="text-xl font-semibold mb-4">Enter Blog Name</h2>
            <input
              type="text"
              placeholder="My Awesome Blog"
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              tw="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div tw="flex justify-end space-x-2">
              <PrimaryButton onClick={() => setShowPublishModal(false)}>Cancel</PrimaryButton>
              <PrimaryButton onClick={handlePublishFromModal}>Publish</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal to show published URL */}
      {publishedUrl && (
        <div tw="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div tw="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
            <h2 tw="text-xl font-semibold mb-4">✅ Published Successfully!</h2>
            <p>Share your site:</p>
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              tw="text-blue-600 underline break-words"
            >
              {publishedUrl}
            </a>
            <div tw="mt-6">
              <PrimaryButton onClick={() => setPublishedUrl(null)}>OK</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <Header />
      <Container>
        <ContentWithPaddingXl>
          <HeadingRow>
            <Heading>{post?.blogTitle || "Untitled"}</Heading>
            {alreadyPublished ? (
              <PrimaryButton
                onClick={handleUnpublish}
                disabled={isPublishing}
                tw="bg-red-500 hover:bg-red-700"
              >
                {isPublishing ? "Unpublishing..." : "Unpublish"}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => setShowPublishModal(true)}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </PrimaryButton>
            )}
          </HeadingRow>
          <Text>
            <ReactMarkdown>{post?.blogContent || ""}</ReactMarkdown>
          </Text>
        </ContentWithPaddingXl>
      </Container>
      <Footer />
    </AnimationRevealPage>
  );
};
