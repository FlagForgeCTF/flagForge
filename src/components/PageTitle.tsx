import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  title: string;
}

const PageTitle = ({ title }: Props) => {
  const location = useLocation();

  useEffect(() => {
    document.title = location.pathname === "/" ? title : `${title} | Flagforge`;
  }, [location, title]);
  return null;
};

export default PageTitle;
