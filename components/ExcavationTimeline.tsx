"use client";

import { motion } from "framer-motion";
import type { Stratum } from "@/types/lexica";
import StratumBlock from "./StratumBlock";
import SemanticShift from "./SemanticShift";
import { getFamilyColor } from "@/lib/language-meta";

interface ExcavationTimelineProps {
  strata: Stratum[];
}

export default function ExcavationTimeline({ strata }: ExcavationTimelineProps) {
  const totalHeight = strata.length * 100;

  return (
    <div className="relative">
      {/* Timeline spine */}
      <div className="absolute left-3 md:left-5 top-0 bottom-0 w-px">
        <motion.div
          className="w-full h-full bg-gradient-to-b from-gold/40 via-gold/20 to-gold/40"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformOrigin: "top" }}
        />
      </div>

      {/* Strata with connectors */}
      <div className="relative">
        {strata.map((stratum, i) => {
          const familyColor = getFamilyColor(stratum.language_family || "Other");
          const showShift = i > 0 && strata[i].form !== strata[i - 1].form;

          return (
            <div key={i}>
              {/* Semantic shift connector between strata */}
              {showShift && (
                <SemanticShift
                  fromForm={strata[i].form}
                  toForm={strata[i - 1].form}
                  fromLang={strata[i].language}
                  toLang={strata[i - 1].language}
                  familyColor={familyColor}
                />
              )}

              {/* Timeline node dot */}
              <div className="relative">
                <motion.div
                  className="absolute left-1 md:left-3 top-6 z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 300 }}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      borderColor: stratum.is_root ? "#c8920a" : familyColor,
                      backgroundColor: stratum.is_root ? "#c8920a" : `${familyColor}40`,
                    }}
                  />
                </motion.div>

                {/* Connector line from dot to block */}
                <motion.div
                  className="absolute left-[1.1rem] md:left-[1.6rem] top-[1.85rem] h-px z-10"
                  style={{
                    width: "1rem",
                    background: stratum.is_root
                      ? "#c8920a"
                      : familyColor,
                    opacity: 0.4,
                    borderTop: stratum.relationship_type === "borrowed"
                      ? `1px dashed ${familyColor}`
                      : stratum.relationship_type === "derived"
                        ? `1px dotted ${familyColor}`
                        : "none",
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.2 + 0.4 }}
                />

                {/* Stratum block with left indent */}
                <div
                  className="pl-10 md:pl-14"
                  style={{ paddingLeft: undefined }}
                >
                  <div className="ml-8 md:ml-12">
                    <StratumBlock
                      stratum={stratum}
                      index={i}
                      total={strata.length}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Terminal marker at the bottom */}
        <motion.div
          className="absolute left-[0.35rem] md:left-[0.85rem] bottom-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: strata.length * 0.2 + 0.5 }}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
