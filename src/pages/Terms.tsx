import LegalPage from "@/components/LegalPage";
import { SeoHead } from "@/components/SeoHead";

const Terms = () => {
  return (
    <>
    <SeoHead pageTitle="Terms & Conditions" />
    <LegalPage
      slug="terms-and-conditions"
      fallbackTitle="Terms of Service"
      fallbackSubtitle="These terms outline the rules and guidelines for using Kumar Music."
    />
    </>
  );
};

export default Terms;
