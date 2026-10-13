import { chaptersData } from './chapters';
import { stripInlineMarkdown } from '../lib/inlineMarkdown';

/** The standalone architecture guides, keyed like `guideSchemas`. */
export const guides = {
  roadmap: { href: '/roadmap', label: 'Zig Developer Roadmap' },
  philosophy: { href: '/philosophy', label: 'The Philosophy & Zen of Zig' },
  cheatsheet: { href: '/cheatsheet', label: 'JavaScript to Zig Rosetta Stone Cheatsheet' },
  pitfalls: { href: '/pitfalls', label: 'Zig Pitfalls & Footguns' },
  memory: { href: '/memory', label: 'Memory & Allocator Architecture' },
  comptime: { href: '/comptime', label: 'Comptime Metaprogramming Mastery' },
  buildSystem: { href: '/build-system', label: 'build.zig vs npm & Package Management' },
  cInterop: { href: '/c-interop', label: 'C Interoperability & Node-API Addons' },
  microservice: { href: '/microservice', label: 'Production Microservice Architecture' },
  docker: { href: '/docker', label: 'Production Docker Recipes' },
  troubleshooting: { href: '/troubleshooting', label: 'Diagnostics & Debugging Playbook' },
  leetcode: { href: '/leetcode', label: 'LeetCode & Classic Algorithms in Zig' },
  interviews: { href: '/interviews', label: 'Senior Systems Interview Q&A' },
} as const;

export type GuideSlug = keyof typeof guides;

interface ChapterCluster {
  guides: GuideSlug[];
  chapters: string[];
}

/**
 * The one hand-curated link table. Guide pages are derived from it by inversion,
 * so a chapter listing a guide guarantees that guide links back to the chapter.
 */
export const chapterClusters: Record<string, ChapterCluster> = {
  basic_vars: { guides: ['cheatsheet', 'philosophy'], chapters: ['functions_params', 'pointers_basics', 'optimization_modes'] },
  functions_params: { guides: ['cheatsheet'], chapters: ['basic_vars', 'pointers_basics', 'generics_in_practice'] },
  arrays_and_slices: { guides: ['cheatsheet', 'memory'], chapters: ['strings_and_bytes', 'arraylist', 'binary_search'] },
  strings_and_bytes: { guides: ['cheatsheet', 'pitfalls'], chapters: ['arrays_and_slices', 'formatting_and_printing', 'hashmap'] },
  control_flow: { guides: ['cheatsheet'], chapters: ['blocks_as_expressions', 'optionals_null', 'tagged_unions'] },
  blocks_as_expressions: { guides: ['cheatsheet'], chapters: ['control_flow', 'try_and_catch', 'comptime_intro'] },
  errors_as_values: { guides: ['pitfalls', 'troubleshooting'], chapters: ['try_and_catch', 'inferred_error_sets', 'defer_and_errdefer'] },
  try_and_catch: { guides: ['pitfalls', 'cheatsheet'], chapters: ['errors_as_values', 'inferred_error_sets', 'json_parsing_comptime'] },
  defer_and_errdefer: { guides: ['pitfalls', 'memory'], chapters: ['allocators_philosophy', 'file_io', 'memory_leak_detection'] },
  inferred_error_sets: { guides: ['pitfalls'], chapters: ['errors_as_values', 'try_and_catch', 'compile_time_assertions'] },
  optionals_null: { guides: ['pitfalls', 'cheatsheet'], chapters: ['pointers_basics', 'hashmap', 'reverse_linked_list'] },
  pointers_basics: { guides: ['memory', 'pitfalls'], chapters: ['arrays_and_slices', 'reverse_linked_list', 'c_interop_basics'] },
  memory_layout_structs: { guides: ['memory', 'cInterop'], chapters: ['tagged_unions', 'comptime_reflection', 'c_interop_basics'] },
  tagged_unions: { guides: ['cheatsheet', 'comptime'], chapters: ['memory_layout_structs', 'control_flow', 'json_parsing_comptime'] },
  allocators_philosophy: { guides: ['memory', 'philosophy'], chapters: ['arena_allocator', 'fixed_buffer_allocator', 'memory_leak_detection'] },
  arena_allocator: { guides: ['memory', 'microservice'], chapters: ['allocators_philosophy', 'fixed_buffer_allocator', 'http_server_fundamentals'] },
  fixed_buffer_allocator: { guides: ['memory'], chapters: ['allocators_philosophy', 'arena_allocator', 'custom_allocator_implementation'] },
  memory_leak_detection: { guides: ['memory', 'troubleshooting'], chapters: ['allocators_philosophy', 'defer_and_errdefer', 'unit_testing'] },
  comptime_intro: { guides: ['comptime'], chapters: ['comptime_reflection', 'generics_in_practice', 'zero_cost_abstractions'] },
  comptime_reflection: { guides: ['comptime'], chapters: ['comptime_intro', 'compile_time_assertions', 'json_parsing_comptime'] },
  compile_time_assertions: { guides: ['comptime', 'pitfalls'], chapters: ['comptime_reflection', 'generics_in_practice', 'unit_testing'] },
  generics_in_practice: { guides: ['comptime', 'memory'], chapters: ['comptime_intro', 'arraylist', 'hashmap'] },
  arraylist: { guides: ['memory', 'cheatsheet'], chapters: ['generics_in_practice', 'allocators_philosophy', 'arrays_and_slices'] },
  hashmap: { guides: ['memory', 'leetcode'], chapters: ['generics_in_practice', 'two_sum', 'strings_and_bytes'] },
  file_io: { guides: ['microservice', 'pitfalls'], chapters: ['defer_and_errdefer', 'formatting_and_printing', 'errors_as_values'] },
  formatting_and_printing: { guides: ['cheatsheet', 'comptime'], chapters: ['strings_and_bytes', 'file_io', 'comptime_intro'] },
  threads_basics: { guides: ['microservice'], chapters: ['atomics_and_mutexes', 'channel_patterns', 'event_loops_in_zig'] },
  atomics_and_mutexes: { guides: ['microservice', 'pitfalls'], chapters: ['threads_basics', 'channel_patterns', 'observability_metrics'] },
  channel_patterns: { guides: ['microservice'], chapters: ['threads_basics', 'atomics_and_mutexes', 'graceful_shutdown'] },
  event_loops_in_zig: { guides: ['microservice', 'interviews'], chapters: ['threads_basics', 'http_server_fundamentals', 'bun_and_tigerbeetle_case_studies'] },
  c_interop_basics: { guides: ['cInterop', 'buildSystem'], chapters: ['napi_addons', 'database_sqlite', 'cross_compilation'] },
  napi_addons: { guides: ['cInterop', 'buildSystem'], chapters: ['c_interop_basics', 'wasm_compilation', 'build_zig'] },
  wasm_compilation: { guides: ['cInterop', 'buildSystem'], chapters: ['napi_addons', 'cross_compilation', 'fixed_buffer_allocator'] },
  cross_compilation: { guides: ['buildSystem', 'docker'], chapters: ['build_zig', 'c_interop_basics', 'docker_scratch_containers'] },
  build_zig: { guides: ['buildSystem'], chapters: ['zig_package_manager', 'unit_testing', 'cross_compilation'] },
  zig_package_manager: { guides: ['buildSystem', 'troubleshooting'], chapters: ['build_zig', 'c_interop_basics', 'ci_cd_github_actions'] },
  unit_testing: { guides: ['buildSystem', 'troubleshooting'], chapters: ['memory_leak_detection', 'build_zig', 'ci_cd_github_actions'] },
  optimization_modes: { guides: ['buildSystem', 'pitfalls'], chapters: ['build_zig', 'basic_vars', 'zero_cost_abstractions'] },
  http_server_fundamentals: { guides: ['microservice', 'memory'], chapters: ['arena_allocator', 'json_parsing_comptime', 'graceful_shutdown'] },
  json_parsing_comptime: { guides: ['microservice', 'comptime'], chapters: ['comptime_reflection', 'http_server_fundamentals', 'tagged_unions'] },
  database_sqlite: { guides: ['cInterop', 'microservice'], chapters: ['c_interop_basics', 'zig_package_manager', 'defer_and_errdefer'] },
  graceful_shutdown: { guides: ['microservice', 'docker'], chapters: ['channel_patterns', 'http_server_fundamentals', 'atomics_and_mutexes'] },
  docker_scratch_containers: { guides: ['docker', 'buildSystem'], chapters: ['cross_compilation', 'optimization_modes', 'ci_cd_github_actions'] },
  ci_cd_github_actions: { guides: ['docker', 'buildSystem'], chapters: ['unit_testing', 'zig_package_manager', 'docker_scratch_containers'] },
  observability_metrics: { guides: ['microservice', 'troubleshooting'], chapters: ['atomics_and_mutexes', 'http_server_fundamentals', 'production_debugging_gdb_lldb'] },
  two_sum: { guides: ['leetcode', 'interviews'], chapters: ['hashmap', 'valid_parentheses', 'binary_search'] },
  valid_parentheses: { guides: ['leetcode'], chapters: ['fixed_buffer_allocator', 'two_sum', 'reverse_linked_list'] },
  reverse_linked_list: { guides: ['leetcode', 'memory'], chapters: ['pointers_basics', 'optionals_null', 'binary_search'] },
  binary_search: { guides: ['leetcode', 'interviews'], chapters: ['arrays_and_slices', 'two_sum', 'simd_vectorization'] },
  simd_vectorization: { guides: ['comptime', 'interviews'], chapters: ['zero_cost_abstractions', 'optimization_modes', 'binary_search'] },
  custom_allocator_implementation: { guides: ['memory', 'interviews'], chapters: ['allocators_philosophy', 'fixed_buffer_allocator', 'arena_allocator'] },
  zero_cost_abstractions: { guides: ['comptime', 'philosophy'], chapters: ['comptime_intro', 'simd_vectorization', 'optimization_modes'] },
  production_debugging_gdb_lldb: { guides: ['troubleshooting', 'pitfalls'], chapters: ['memory_leak_detection', 'optimization_modes', 'observability_metrics'] },
  bun_and_tigerbeetle_case_studies: { guides: ['philosophy', 'roadmap'], chapters: ['event_loops_in_zig', 'custom_allocator_implementation', 'zen_of_zig'] },
  senior_interview_questions: { guides: ['interviews', 'memory'], chapters: ['allocators_philosophy', 'comptime_intro', 'event_loops_in_zig'] },
  zen_of_zig: { guides: ['philosophy', 'roadmap'], chapters: ['allocators_philosophy', 'errors_as_values', 'bun_and_tigerbeetle_case_studies'] },
};

export interface RelatedLink {
  href: string;
  label: string;
}

export interface RelatedLinks {
  guides: RelatedLink[];
  chapters: RelatedLink[];
}

function chapterLink(key: string): RelatedLink {
  const chapter = chaptersData[key];
  if (!chapter) throw new Error(`topicClusters references unknown chapter "${key}"`);
  return { href: `/chapter/${key}`, label: `#${chapter.num} ${stripInlineMarkdown(chapter.title)}` };
}

function guideLink(slug: GuideSlug): RelatedLink {
  return { ...guides[slug] };
}

export function chapterRelatedLinks(chapterKey: string): RelatedLinks {
  const cluster = chapterClusters[chapterKey];
  if (!cluster) throw new Error(`chapter "${chapterKey}" has no row in chapterClusters`);
  return {
    guides: cluster.guides.map(guideLink),
    chapters: cluster.chapters.map(chapterLink),
  };
}

/** Lessons whose cluster names this guide (in curriculum order), plus the other guides those lessons point to, most shared first. */
export function guideRelatedLinks(slug: GuideSlug): RelatedLinks {
  const chapterKeys = Object.keys(chapterClusters).filter((key) => chapterClusters[key].guides.includes(slug));

  const sharedLessonCounts = new Map<GuideSlug, number>();
  for (const key of chapterKeys) {
    for (const sibling of chapterClusters[key].guides) {
      if (sibling !== slug) sharedLessonCounts.set(sibling, (sharedLessonCounts.get(sibling) ?? 0) + 1);
    }
  }
  const siblingGuides = [...sharedLessonCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([sibling]) => sibling);

  return {
    guides: siblingGuides.map(guideLink),
    chapters: chapterKeys.map(chapterLink),
  };
}
