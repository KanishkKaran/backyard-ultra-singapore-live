import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Beach Backyard Ultra — Open Category Live Coverage",
  description:"Open-category race coverage, pace estimates, standings and yard-by-yard updates from Beach Backyard Ultra Singapore.",
  openGraph:{
    title:"Beach Backyard Ultra — Open Category",
    description:"Just one more yard. Open-category coverage from Punggol, Singapore.",
  },
};

export default function OpenLayout({children}:{children:React.ReactNode}){return children;}
