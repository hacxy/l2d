/// <reference types="vite/client" />
import { loadModels } from './framework/models';
import { buildSidebar, demos, runDemo } from './framework/runner';
import './framework/console';
import './framework/code';

buildSidebar();

const urlStem = new URLSearchParams(location.search).get('demo');
const initialIndex = urlStem ? demos.findIndex(d => d.stem === urlStem) : 0;
if (demos.length > 0)
  runDemo(initialIndex >= 0 ? initialIndex : 0);

loadModels();
