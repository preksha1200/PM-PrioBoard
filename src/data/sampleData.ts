import type { Idea } from '../types';

export function createSampleIdeas(): Idea[] {
  const now = new Date();
  
  return [
    {
      id: crypto.randomUUID(),
      title: "Mobile App Push Notifications",
      notes: "Implement smart push notifications to re-engage users who haven't opened the app in 7+ days",
      reach: 15000,
      impact: 3,
      confidence: 0.8,
      effort: 2,
      score: 18, // (15000 * 3 * 0.8) / 2 = 18000
      tags: ["mobile", "engagement", "notifications"],
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isComplete: true
    },
    {
      id: crypto.randomUUID(),
      title: "Advanced Search Filters",
      notes: "Add category, price range, and location-based filtering to improve search experience",
      reach: 8000,
      impact: 2,
      confidence: 0.9,
      effort: 3,
      score: 4.8, // (8000 * 2 * 0.9) / 3 = 4800
      tags: ["search", "ux", "filters"],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isComplete: true
    },
    {
      id: crypto.randomUUID(),
      title: "Dark Mode Theme",
      notes: "Implement system-wide dark mode with user preference persistence",
      reach: 12000,
      impact: 1,
      confidence: 0.95,
      effort: 1.5,
      score: 7.6, // (12000 * 1 * 0.95) / 1.5 = 7600
      tags: ["ui", "theme", "accessibility"],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isComplete: true
    },
    {
      id: crypto.randomUUID(),
      title: "Social Media Integration",
      notes: "Allow users to share content directly to Facebook, Twitter, and Instagram",
      reach: 20000,
      impact: 2,
      confidence: 0.6,
      effort: 4,
      score: 6, // (20000 * 2 * 0.6) / 4 = 6000
      tags: ["social", "sharing", "integration"],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isComplete: true
    },
    {
      id: crypto.randomUUID(),
      title: "Real-time Collaboration",
      notes: "Enable multiple users to collaborate on projects in real-time with live cursors and comments",
      reach: 5000,
      impact: 3,
      confidence: 0.4,
      effort: 5,
      score: 1.2, // (5000 * 3 * 0.4) / 5 = 1200
      tags: ["collaboration", "realtime", "productivity"],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isComplete: true
    },
    {
      id: crypto.randomUUID(),
      title: "Analytics Dashboard",
      notes: "Comprehensive analytics dashboard showing user engagement, feature usage, and business metrics",
      reach: 3000,
      impact: 2,
      confidence: 0.7,
      effort: 3,
      score: 1.4, // (3000 * 2 * 0.7) / 3 = 1400
      tags: ["analytics", "dashboard", "metrics"],
      createdAt: now.toISOString(),
      isComplete: true
    }
  ];
}
