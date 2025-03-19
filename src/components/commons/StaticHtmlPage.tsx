import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckoutRoutes } from "../../routes/models/routeModel";

interface StaticHtmlPageProps {
  htmlPath: string;
}

const StaticHtmlPage: React.FC<StaticHtmlPageProps> = ({ htmlPath }) => {
  const [content, setContent] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const absolutePath = htmlPath.startsWith("/") ? htmlPath : `/${htmlPath}`;

    fetch(absolutePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        const baseTag = `<base href="${absolutePath.substring(
          0,
          absolutePath.lastIndexOf("/")
        )}/">`;
        const modifiedHtml = html.replace(/<head>/i, `<head>${baseTag}`);
        setContent(modifiedHtml);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Error loading HTML content:", error);
        navigate(`/${CheckoutRoutes.ERRORE}`);
      });
  }, [htmlPath, navigate]);

  return (
    <div
      className="static-html-wrapper"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default StaticHtmlPage;
