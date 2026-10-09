"use client";

import { Calculator } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import GpaCalculator from "@/components/freshman/GpaCalculator";

export default function CollapsibleGpa() {
  return (
    <CollapsibleSection
      title="GPA calculator"
      subtitle="Estimate your average"
      icon={<Calculator className="w-5 h-5 text-purple-300" />}
      defaultOpen={false}
    >
      <GpaCalculator />
    </CollapsibleSection>
  );
}
