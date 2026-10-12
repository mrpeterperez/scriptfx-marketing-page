import { DesignKit } from "@/components/design-kit/design-kit";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Design Kit", "Explore ScriptFX typography, colors, spacing, and components. Preview and save local design settings.", "/design-kit", false);
export default function Page() { return <DesignKit />; }
