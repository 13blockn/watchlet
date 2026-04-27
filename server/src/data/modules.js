const modules = [
  {
    slug: 'basics',
    title: 'Watch Basics & Anatomy',
    category: 'Basics',
    summary: 'Understand the core parts that make every watch work.',
    lessons: [
      { title: 'Anatomy at a glance', content: ['A wristwatch is built from a case, crystal, dial, hands, and strap or bracelet.', 'The case protects the movement; the bezel sits around the crystal and may be fixed or rotating.', 'The crown is used to wind and set the watch, and in water-resistant watches it can screw down for sealing.'] },
      { title: 'Inside the dial', content: ['Indices, numerals, and lume improve readability in different lighting conditions.', 'Sub-dials show extra information like elapsed minutes on a chronograph or a second time zone.', 'Date windows and power reserve displays are common entry-level complications.'] },
      { title: 'Materials and finishing', content: ['316L steel is common for durability, while titanium reduces weight and improves comfort.', 'Sapphire crystal resists scratches far better than mineral crystal or acrylic.', 'Brushed and polished surfaces influence both aesthetics and visibility of wear.'] }
    ]
  },
  {
    slug: 'movements',
    title: 'Movements & Escapements',
    category: 'Movements',
    summary: 'Learn how different movement types keep time and why accuracy varies.',
    lessons: [
      { title: 'Quartz vs mechanical', content: ['Quartz watches use battery-powered oscillation from a quartz crystal, usually at 32,768 Hz.', 'Mechanical watches rely on a mainspring and gear train, powered by manual winding or a rotor.', 'Automatic watches are mechanical watches that self-wind with wrist motion.'] },
      { title: 'Escapement and regulation', content: ['The escapement meters power release from the mainspring to the balance wheel.', 'Beat rate is measured in vibrations per hour; 28,800 vph is common in modern calibers.', 'Regulation adjusts timing to improve real-world rate consistency.'] },
      { title: 'Service and longevity', content: ['Mechanical movements require periodic service because lubricants age and parts wear.', 'Quartz movements need battery changes and occasional gasket replacement.', 'Reliable movements balance robustness, parts availability, and ease of maintenance.'] }
    ]
  },
  {
    slug: 'complications',
    title: 'Complications',
    category: 'Complications',
    summary: 'Explore useful and high-end complications from date to perpetual calendar.',
    lessons: [
      { title: 'Utility complications', content: ['A complication is any function beyond simple hours, minutes, and seconds.', 'Common utility complications include date, day-date, GMT, and chronograph.', 'Diver bezels and countdown bezels can serve timing functions without extra movement complexity.'] },
      { title: 'Advanced complications', content: ['A perpetual calendar tracks irregular month lengths and leap years.', 'A minute repeater chimes the time acoustically on demand.', 'Tourbillons were designed to reduce positional error, though modern benefit is largely prestige.'] },
      { title: 'Practical selection', content: ['Choose complications based on your routine: GMT for travel, chronograph for timing tasks.', 'More complications can increase service complexity and cost.', 'Legibility matters as much as technical capability.'] }
    ]
  },
  {
    slug: 'brands-models',
    title: 'Brands & Iconic Models',
    category: 'Brands',
    summary: 'Recognize influential brands and reference models every enthusiast should know.',
    lessons: [
      { title: 'Swiss and Japanese pillars', content: ['Rolex is known for robust tool watches and tightly controlled production.', 'Omega blends technical milestones with broad sports and dress collections.', 'Seiko covers everything from affordable daily wear to high-end Grand Seiko craftsmanship.'] },
      { title: 'Icons by model', content: ['Rolex Submariner helped define the modern dive watch template.', 'Omega Speedmaster is famous for NASA spaceflight history.', 'Patek Philippe Nautilus and Audemars Piguet Royal Oak shaped luxury sport watch design.'] },
      { title: 'Brand positioning', content: ['Some brands emphasize heritage and finishing, others value innovation or utility.', 'Independent makers often focus on low-volume craft and design experimentation.', 'Understanding market position helps collectors buy with intent rather than hype.'] }
    ]
  },
  {
    slug: 'history',
    title: 'Watch History & Collecting',
    category: 'History',
    summary: 'Trace key milestones and build a strong collecting foundation.',
    lessons: [
      { title: 'Major milestones', content: ['Portable timekeeping evolved from pocket watches to wristwatches in the early 20th century.', 'The 1969 race for automatic chronographs produced several landmark calibers.', 'The quartz crisis in the 1970s disrupted Swiss mechanical dominance and reshaped the industry.'] },
      { title: 'Collecting essentials', content: ['Condition, originality, and service history often matter more than hype.', 'Box and papers can influence value, especially for modern collectibles.', 'A balanced collection can include tool, dress, travel, and historical pieces.'] },
      { title: 'Terminology and market literacy', content: ['Terms like lug-to-lug, rehaut, and patina are useful when comparing listings.', 'Reference numbers identify specific configurations and production eras.', 'Buying from trusted sources and verifying provenance lowers risk.'] }
    ]
  }
];

module.exports = modules;
