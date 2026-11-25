// Registers the "jobs are the ad" compositions: the black-and-white New Era versions in src/jobs/classic/.
import React from "react";
import { Folder } from "remotion";
import { exampleComp } from "./kit/Example";
import { comps as classic } from "./classic";
import { comps as sets } from "./sets";
import { comps as final } from "./final";

export const JobsRoot: React.FC = () => (
  <Folder name="Jobs">
    {exampleComp}
    <Folder name="Classic">{classic}</Folder>
    <Folder name="Sets">{sets}</Folder>
    <Folder name="Final">{final}</Folder>
  </Folder>
);
