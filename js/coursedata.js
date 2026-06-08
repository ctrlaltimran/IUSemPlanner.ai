/* ============================================================================
   COURSE LIBRARY — study knowledge base for the "Courses" tab
   ============================================================================
   A curated reference for the BS Software Engineering program at Iqra
   University. Each entry powers the Courses tab (search + detail view) AND is
   fed to the AI so it can answer study questions accurately.

   To add or edit a course, just copy one object in the array below and change
   the fields. Keep the shape the same:

     {
       code, title, semester, credits,
       short,         // one-line summary
       detailed,      // a paragraph explaining the course
       topics: [],    // important topics / syllabus outline
       notes: [],     // concise study notes / key takeaways
       examPrep: [],  // exam preparation points
       keywords: [],  // search keywords
     }
   ========================================================================== */

const COURSE_LIBRARY = [
  {
    code: 'SEN131', title: 'Programming Fundamentals', semester: 2, credits: 3,
    short: 'Your first real programming course — variables, control flow, functions.',
    detailed: 'Introduces structured programming using a high-level language (usually C/C++). You learn how a program is written, compiled and executed, how to store and manipulate data, and how to break problems into reusable functions. It is the foundation every later coding course builds on.',
    topics: ['Variables, data types & operators', 'Input/output', 'Conditionals (if / switch)', 'Loops (for / while / do-while)', 'Functions & scope', 'Arrays & strings', 'Pointers (intro)', 'Basic file handling'],
    notes: ['Master loops and arrays early — most exam questions are loop/array logic.', 'Trace code on paper: write the value of each variable line by line.', 'A function should do ONE thing; pass parameters instead of using globals.', 'Off-by-one errors (<= vs <) are the #1 bug source.'],
    examPrep: ['Practice dry-runs: given code, predict the exact output.', 'Be able to write: factorial, Fibonacci, prime check, array sum/max, string reverse.', 'Know the difference between pass-by-value and pass-by-reference.'],
    keywords: ['c', 'c++', 'programming', 'loops', 'arrays', 'functions', 'pointers', 'basics', 'coding'],
  },
  {
    code: 'SEN231', title: 'Object Oriented Programming', semester: 3, credits: 3,
    short: 'Model real-world things as classes and objects (C++/Java).',
    detailed: 'Shifts thinking from procedures to objects. You design classes that bundle data and behaviour, then use the four pillars (encapsulation, abstraction, inheritance, polymorphism) to build flexible, reusable software.',
    topics: ['Classes & objects', 'Constructors & destructors', 'Encapsulation & access specifiers', 'Inheritance', 'Polymorphism (overloading & overriding)', 'Abstraction & interfaces', 'Operator overloading', 'Composition vs inheritance'],
    notes: ['The 4 pillars: Encapsulation, Abstraction, Inheritance, Polymorphism — memorise with examples.', 'Overloading = same name, different parameters (compile time). Overriding = redefining a base method (run time).', 'Prefer composition ("has-a") over inheritance ("is-a") when unsure.', 'A virtual function enables run-time polymorphism in C++.'],
    examPrep: ['Be ready to write a class with constructor, getters/setters, and a method.', 'Draw class diagrams showing inheritance arrows.', 'Explain each pillar with a one-line code example.'],
    keywords: ['oop', 'class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'java', 'c++'],
  },
  {
    code: 'SEN232', title: 'Data Structures and Algorithms', semester: 4, credits: 3,
    short: 'How to store data efficiently and the algorithms that act on it.',
    detailed: 'Covers the core data structures (arrays, lists, stacks, queues, trees, graphs, hash tables) and the algorithms that operate on them, plus how to reason about time and space complexity using Big-O notation. This is the single most important course for technical interviews.',
    topics: ['Big-O / time & space complexity', 'Arrays & linked lists', 'Stacks & queues', 'Recursion', 'Trees (BST, AVL, heaps)', 'Hashing & hash tables', 'Graphs (BFS, DFS)', 'Sorting (merge, quick, heap)', 'Searching (binary search)'],
    notes: ['Know Big-O for every structure: array access O(1), search O(n); BST search O(log n) average.', 'Stack = LIFO, Queue = FIFO.', 'Merge & heap sort are O(n log n) worst case; quicksort is O(n²) worst, O(n log n) average.', 'BFS uses a queue, DFS uses a stack/recursion.'],
    examPrep: ['Be able to trace a sort step by step on a small array.', 'Write linked-list insert/delete and BST insert.', 'Derive the Big-O of a given loop nest.'],
    keywords: ['dsa', 'data structures', 'algorithms', 'big o', 'tree', 'graph', 'sorting', 'linked list', 'stack', 'queue', 'hashing'],
  },
  {
    code: 'SEN221', title: 'Operating Systems', semester: 4, credits: 3,
    short: 'How the OS manages processes, memory, files and devices.',
    detailed: 'Explains what sits between hardware and applications: how processes are scheduled, how memory is allocated and virtualised, how concurrency is coordinated, and how files and I/O are handled.',
    topics: ['Processes & threads', 'CPU scheduling (FCFS, SJF, RR, priority)', 'Process synchronization (mutex, semaphores)', 'Deadlocks', 'Memory management & paging', 'Virtual memory', 'File systems', 'I/O management'],
    notes: ['Deadlock needs all 4 Coffman conditions: mutual exclusion, hold-and-wait, no preemption, circular wait.', 'A semaphore is a signalling counter; a mutex is a lock for one resource.', 'Round Robin uses a time quantum; SJF gives the minimum average waiting time.', 'Paging removes external fragmentation; it can cause internal fragmentation.'],
    examPrep: ['Compute average waiting/turnaround time for FCFS, SJF, RR given a process table.', 'Solve a banker’s-algorithm deadlock-avoidance problem.', 'Convert logical to physical addresses with paging.'],
    keywords: ['os', 'operating system', 'process', 'thread', 'scheduling', 'deadlock', 'memory', 'paging', 'semaphore'],
  },
  {
    code: 'SEN331', title: 'Database Management Systems', semester: 5, credits: 3,
    short: 'Design relational databases and query them with SQL.',
    detailed: 'Teaches how to model data with ER diagrams, turn that into normalized relational tables, and query/modify data with SQL. Also covers transactions and the ACID guarantees that keep data correct.',
    topics: ['ER modelling', 'Relational model & keys', 'Normalization (1NF, 2NF, 3NF, BCNF)', 'SQL (DDL, DML, joins, sub-queries)', 'Functional dependencies', 'Transactions & ACID', 'Indexing', 'Concurrency control'],
    notes: ['Keys: super key ⊇ candidate key ⊇ primary key; foreign key references another table.', 'Normalization order: 1NF (atomic) → 2NF (no partial dependency) → 3NF (no transitive dependency) → BCNF.', 'ACID = Atomicity, Consistency, Isolation, Durability.', 'INNER JOIN keeps matches; LEFT JOIN keeps all left rows.'],
    examPrep: ['Draw an ER diagram and map it to tables.', 'Normalize a messy table up to 3NF and justify each step.', 'Write SQL with joins, GROUP BY and HAVING.'],
    keywords: ['dbms', 'database', 'sql', 'normalization', 'er diagram', 'acid', 'joins', 'transactions', 'keys'],
  },
  {
    code: 'SEN251', title: 'Software Engineering', semester: 4, credits: 3,
    short: 'The disciplined process of building software in teams.',
    detailed: 'Introduces the full software development life cycle (SDLC) and the process models, requirements, design, testing and project practices used to deliver software that meets user needs on time.',
    topics: ['SDLC & process models (Waterfall, Incremental, Spiral)', 'Agile & Scrum', 'Requirements engineering', 'Software design principles', 'UML diagrams', 'Testing levels', 'Configuration management', 'Software metrics'],
    notes: ['Waterfall is sequential; Agile is iterative and embraces change.', 'Scrum roles: Product Owner, Scrum Master, Dev Team. Events: sprint, daily standup, review, retrospective.', 'Functional vs non-functional requirements (what it does vs how well).', 'Coupling should be LOW, cohesion should be HIGH.'],
    examPrep: ['Compare process models with pros/cons and when to use each.', 'Draw use-case and class diagrams for a given scenario.', 'List the Agile manifesto values.'],
    keywords: ['software engineering', 'sdlc', 'agile', 'scrum', 'waterfall', 'uml', 'requirements', 'process model'],
  },
  {
    code: 'SEN361', title: 'Data Communication and Computer Networks', semester: 6, credits: 3,
    short: 'How data travels across networks — models, protocols and addressing.',
    detailed: 'Explains the layered models (OSI and TCP/IP), how devices are addressed and routed, and the protocols that move data reliably from one machine to another across the internet.',
    topics: ['OSI & TCP/IP models', 'Physical & data-link layer', 'Error detection (CRC, checksum)', 'IP addressing & subnetting', 'Routing', 'TCP vs UDP', 'DNS, HTTP, DHCP', 'Switching & VLANs'],
    notes: ['OSI 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application ("Please Do Not Throw Sausage Pizza Away").', 'TCP is reliable/connection-oriented; UDP is fast/connectionless.', 'IP is layer 3 (logical), MAC is layer 2 (physical).', 'Subnet mask separates network bits from host bits.'],
    examPrep: ['Do subnetting: given an IP/mask, find network, broadcast and host range.', 'Map a protocol to its OSI layer.', 'Explain the TCP three-way handshake.'],
    keywords: ['networks', 'osi', 'tcp', 'udp', 'ip', 'subnetting', 'routing', 'dns', 'protocols', 'data communication'],
  },
  {
    code: 'SEN356', title: 'Information Security', semester: 6, credits: 3,
    short: 'Protecting data and systems — the CIA triad, crypto and threats.',
    detailed: 'Covers the principles of keeping information confidential, intact and available, the cryptographic tools used to do it, and the common attacks and defences in modern systems.',
    topics: ['CIA triad', 'Symmetric & asymmetric encryption', 'Hashing & digital signatures', 'Authentication & access control', 'Common attacks (phishing, SQLi, XSS, MITM)', 'Network security & firewalls', 'Security policies', 'Risk management'],
    notes: ['CIA = Confidentiality, Integrity, Availability.', 'Symmetric = one shared key (fast, e.g. AES). Asymmetric = public/private key pair (e.g. RSA).', 'Hashing is one-way; encryption is reversible with a key.', 'Defence in depth = multiple layers of security.'],
    examPrep: ['Explain symmetric vs asymmetric with a use case for each.', 'Describe how a digital signature provides authenticity + integrity.', 'Identify the attack from a described scenario and its mitigation.'],
    keywords: ['security', 'cia triad', 'encryption', 'cryptography', 'rsa', 'aes', 'hashing', 'firewall', 'attacks', 'infosec'],
  },
  {
    code: 'SEN355', title: 'Web Engineering', semester: 6, credits: 3,
    short: 'Designing and building modern, multi-tier web applications.',
    detailed: 'Teaches the full web stack: structuring pages with HTML, styling with CSS, interactivity with JavaScript, talking to servers and databases, and the architecture and security concerns of real web apps.',
    topics: ['HTML5 & semantic markup', 'CSS layout (flexbox, grid) & responsive design', 'JavaScript & the DOM', 'Client–server architecture', 'HTTP & REST APIs', 'Server-side scripting & databases', 'Sessions, cookies & authentication', 'Web security (XSS, CSRF)'],
    notes: ['Separation of concerns: HTML = structure, CSS = presentation, JS = behaviour.', 'Front-end runs in the browser; back-end runs on the server.', 'REST uses GET (read), POST (create), PUT (update), DELETE (remove).', 'Never trust client input — always validate on the server.'],
    examPrep: ['Build a small responsive page with flexbox/grid.', 'Explain the request/response cycle of an HTTP GET.', 'Describe how sessions keep a user logged in.'],
    keywords: ['web', 'html', 'css', 'javascript', 'rest', 'http', 'frontend', 'backend', 'dom', 'responsive'],
  },
  {
    code: 'SEN352', title: 'Human Computer Interaction', semester: 5, credits: 3,
    short: 'Designing interfaces that are usable and pleasant for people.',
    detailed: 'Studies how humans perceive and interact with software, and the principles and processes (user research, prototyping, usability testing) for designing interfaces that are effective, efficient and satisfying.',
    topics: ['Usability principles', 'Norman’s design principles (affordance, feedback)', 'User-centred design process', 'Prototyping (low/high fidelity)', 'Heuristic evaluation (Nielsen’s 10)', 'Accessibility', 'Cognitive load & mental models', 'Usability testing'],
    notes: ['Affordance = what an object suggests you can do with it.', 'Always give the user feedback for every action.', 'Nielsen’s heuristics include: visibility of system status, match to real world, error prevention, consistency.', 'Test with real users early and often.'],
    examPrep: ['Apply Nielsen’s heuristics to critique a given UI.', 'Describe the user-centred design cycle.', 'Explain affordance, feedback and mapping with examples.'],
    keywords: ['hci', 'usability', 'ux', 'ui', 'design', 'prototyping', 'nielsen', 'accessibility', 'user'],
  },
  {
    code: 'SEN241', title: 'Discrete Structures', semester: 3, credits: 3,
    short: 'The mathematics behind computer science: logic, sets, proofs.',
    detailed: 'Provides the mathematical foundation for computing: propositional logic, set theory, functions, relations, combinatorics, and graph theory — the tools used to reason about algorithms and data structures.',
    topics: ['Propositional & predicate logic', 'Set theory', 'Functions & relations', 'Mathematical induction & proofs', 'Counting & combinatorics', 'Recurrence relations', 'Graph theory', 'Boolean algebra'],
    notes: ['Logical equivalences: De Morgan’s laws are exam favourites.', 'Proof by induction: base case + inductive step.', 'A relation can be reflexive, symmetric, transitive (equivalence relation has all three).', 'Permutation = order matters; combination = order doesn’t.'],
    examPrep: ['Build truth tables and prove equivalences.', 'Write an induction proof for a summation formula.', 'Solve simple counting problems (nPr, nCr).'],
    keywords: ['discrete', 'logic', 'sets', 'proofs', 'induction', 'combinatorics', 'graph theory', 'boolean', 'maths'],
  },
  {
    code: 'CSC202', title: 'Probability & Statistics', semester: 3, credits: 3,
    short: 'Reasoning about uncertainty and analysing data.',
    detailed: 'Covers descriptive statistics, probability theory, common distributions, and inferential techniques used to analyse data and make decisions under uncertainty — essential for AI, ML and research.',
    topics: ['Descriptive statistics (mean, median, mode, variance)', 'Probability rules', 'Conditional probability & Bayes’ theorem', 'Random variables', 'Distributions (binomial, normal, Poisson)', 'Sampling', 'Hypothesis testing', 'Regression & correlation'],
    notes: ['Mean is sensitive to outliers; median is not.', 'Bayes: P(A|B) = P(B|A)·P(A) / P(B).', 'The normal distribution is symmetric; 68-95-99.7 rule.', 'Correlation ≠ causation.'],
    examPrep: ['Compute mean/median/mode/variance for a data set.', 'Apply Bayes’ theorem to a word problem.', 'Use the normal distribution / z-scores.'],
    keywords: ['probability', 'statistics', 'bayes', 'distribution', 'normal', 'mean', 'variance', 'hypothesis', 'regression'],
  },
  {
    code: 'SEN102', title: 'Calculus & Analytical Geometry', semester: 1, credits: 3,
    short: 'Limits, derivatives, integrals and the geometry of curves.',
    detailed: 'The first university maths course: it builds the calculus toolkit (differentiation and integration) and analytical geometry that underpin physics, optimization and many algorithms.',
    topics: ['Limits & continuity', 'Differentiation rules', 'Applications of derivatives (maxima/minima)', 'Integration techniques', 'Definite integrals & area', 'Analytical geometry (lines, conics)', 'Sequences & series'],
    notes: ['Derivative = rate of change / slope of tangent.', 'Chain rule, product rule, quotient rule — know all three cold.', 'Integration is the reverse of differentiation (+C for indefinite).', 'Set derivative = 0 to find maxima/minima, check second derivative.'],
    examPrep: ['Differentiate composite functions with the chain rule.', 'Find maxima/minima of a function.', 'Evaluate definite integrals and areas under curves.'],
    keywords: ['calculus', 'derivative', 'integral', 'limits', 'geometry', 'maths', 'differentiation', 'integration'],
  },
  {
    code: 'SEN103', title: 'Linear Algebra & Differential Equations', semester: 2, credits: 3,
    short: 'Matrices, vector spaces and equations of change.',
    detailed: 'Combines linear algebra (matrices, vectors, systems of equations, eigenvalues) with the basics of differential equations — both heavily used in graphics, machine learning and engineering.',
    topics: ['Matrices & operations', 'Determinants & inverses', 'Systems of linear equations', 'Vector spaces', 'Eigenvalues & eigenvectors', 'First-order differential equations', 'Linear ODEs'],
    notes: ['A matrix is invertible iff its determinant ≠ 0.', 'Solve linear systems with Gaussian elimination.', 'Eigenvector: Av = λv where λ is the eigenvalue.', 'Linear algebra is the backbone of machine learning.'],
    examPrep: ['Find a matrix inverse and determinant by hand.', 'Solve a linear system with Gaussian elimination.', 'Compute eigenvalues of a 2×2 matrix.'],
    keywords: ['linear algebra', 'matrix', 'determinant', 'eigenvalue', 'differential equations', 'vectors', 'maths'],
  },
  {
    code: 'SEN101', title: 'Applied Physics', semester: 1, credits: 3,
    short: 'Physics for engineers: electricity, magnetism, waves.',
    detailed: 'Applies fundamental physics — especially electricity, magnetism, semiconductors and waves — to engineering and computing hardware, giving the background needed to understand how computers physically work.',
    topics: ['Electric fields & potential', 'Capacitance', 'Current, resistance & circuits (Ohm’s/Kirchhoff’s laws)', 'Magnetism & induction', 'Semiconductors & diodes', 'Waves & oscillations', 'Optics (basics)'],
    notes: ['Ohm’s law: V = IR.', 'Kirchhoff: current in = current out (node); voltage around a loop = 0.', 'Capacitors store charge; Q = CV.', 'Semiconductors (doped silicon) make transistors possible.'],
    examPrep: ['Solve circuit problems with Ohm’s and Kirchhoff’s laws.', 'Calculate capacitance in series/parallel.', 'Explain how a diode conducts.'],
    keywords: ['physics', 'electricity', 'circuits', 'ohm', 'kirchhoff', 'magnetism', 'semiconductor', 'waves'],
  },
  {
    code: 'SE307', title: 'Artificial Intelligence', semester: 0, credits: 3,
    short: 'Making machines reason, search and learn (elective).',
    detailed: 'Introduces the core ideas of AI: representing knowledge, searching for solutions, reasoning under uncertainty, and an introduction to machine learning — the foundation for intelligent systems.',
    topics: ['Intelligent agents', 'Uninformed search (BFS, DFS, UCS)', 'Informed search (A*, greedy, heuristics)', 'Adversarial search (minimax, alpha-beta)', 'Constraint satisfaction', 'Knowledge representation & logic', 'Intro to machine learning', 'Neural networks (overview)'],
    notes: ['A* uses f(n) = g(n) + h(n); it is optimal if h is admissible.', 'Minimax assumes both players play optimally; alpha-beta prunes branches.', 'A heuristic estimates cost to the goal.', 'Supervised vs unsupervised vs reinforcement learning.'],
    examPrep: ['Trace A* search on a small graph with a heuristic table.', 'Run minimax + alpha-beta pruning on a game tree.', 'Differentiate the three machine-learning paradigms.'],
    keywords: ['ai', 'artificial intelligence', 'search', 'a star', 'minimax', 'heuristic', 'agents', 'machine learning'],
  },
  {
    code: 'CS412', title: 'Machine Learning', semester: 0, credits: 3,
    short: 'Algorithms that learn patterns from data (elective).',
    detailed: 'Covers the practical pipeline of machine learning: preparing data, training supervised and unsupervised models, evaluating them properly, and avoiding overfitting.',
    topics: ['Supervised vs unsupervised learning', 'Regression (linear, logistic)', 'Classification (KNN, decision trees, SVM)', 'Clustering (k-means)', 'Overfitting & regularization', 'Train/validation/test split & cross-validation', 'Evaluation metrics (accuracy, precision, recall, F1)', 'Neural networks (intro)'],
    notes: ['Bias–variance tradeoff: underfit = high bias, overfit = high variance.', 'Never evaluate on the training set — use a held-out test set.', 'Precision = TP/(TP+FP); Recall = TP/(TP+FN); F1 balances both.', 'Normalise/scale features before distance-based models (KNN, k-means).'],
    examPrep: ['Compute precision, recall and F1 from a confusion matrix.', 'Explain overfitting and three ways to reduce it.', 'Describe how k-means iterates to convergence.'],
    keywords: ['machine learning', 'ml', 'regression', 'classification', 'clustering', 'overfitting', 'knn', 'svm', 'k-means', 'metrics'],
  },
  {
    code: 'CSC483', title: 'Data Science', semester: 0, credits: 3,
    short: 'Turning raw data into insight (elective).',
    detailed: 'The end-to-end data workflow: collecting and cleaning data, exploring it, visualising it, and drawing statistically sound conclusions, often using Python and its data libraries.',
    topics: ['Data collection & cleaning', 'Exploratory data analysis (EDA)', 'Data visualization', 'Statistics for data science', 'Pandas / NumPy (Python)', 'Feature engineering', 'Intro to predictive modelling', 'Communicating results'],
    notes: ['~80% of data-science work is cleaning and preparing data.', 'EDA first: understand distributions and missing values before modelling.', 'Visualise to find patterns; choose the right chart for the data.', 'Garbage in, garbage out — data quality drives model quality.'],
    examPrep: ['Describe the full data-science pipeline.', 'Explain how to handle missing values and outliers.', 'Pick the right visualization for a given question.'],
    keywords: ['data science', 'python', 'pandas', 'numpy', 'eda', 'visualization', 'cleaning', 'analytics'],
  },
  {
    code: 'SEN351', title: 'Software Construction', semester: 5, credits: 3,
    short: 'Writing clean, maintainable, well-tested code.',
    detailed: 'Focuses on the craft of coding itself: writing readable code, handling errors, refactoring, debugging, using version control, and writing tests — the day-to-day skills of a professional developer.',
    topics: ['Clean code & naming', 'Code style & readability', 'Refactoring', 'Debugging techniques', 'Defensive programming & error handling', 'Unit testing', 'Version control (Git)', 'Code review'],
    notes: ['Code is read far more than it is written — optimise for readability.', 'Refactor in small steps with tests passing after each.', 'Git basics: add → commit → push; branch for features.', 'Fail fast: validate inputs and handle errors near the source.'],
    examPrep: ['Refactor a messy code snippet and justify changes.', 'Explain the Git workflow (clone, branch, merge, conflict).', 'Write a unit test for a simple function.'],
    keywords: ['software construction', 'clean code', 'refactoring', 'git', 'testing', 'debugging', 'version control'],
  },
  {
    code: 'SEN354', title: 'Software Requirement Engineering', semester: 0, credits: 3,
    short: 'Discovering, documenting and managing what software must do.',
    detailed: 'Teaches how to elicit requirements from stakeholders, specify them clearly, validate them, and manage changes — getting requirements wrong is the most expensive mistake in a project.',
    topics: ['Requirements elicitation techniques', 'Functional vs non-functional requirements', 'Use cases & user stories', 'Requirements specification (SRS)', 'Validation & verification', 'Requirements traceability', 'Change/requirements management'],
    notes: ['Functional = what the system does; non-functional = qualities (performance, security).', 'A good requirement is clear, testable, consistent and unambiguous.', 'Use cases capture interactions; user stories capture user value.', 'Fixing a requirement defect in production can cost 100× more than in analysis.'],
    examPrep: ['Write functional and non-functional requirements for a scenario.', 'Create a use case with main and alternate flows.', 'List elicitation techniques and when to use each.'],
    keywords: ['requirements', 'srs', 'use case', 'user story', 'elicitation', 'functional', 'non-functional', 're'],
  },
  {
    code: 'SEN453', title: 'Software Quality Engineering', semester: 7, credits: 3,
    short: 'Ensuring software is correct, reliable and high quality.',
    detailed: 'Covers quality assurance and the full testing discipline: test design, levels of testing, defect management, quality standards and metrics that keep software dependable.',
    topics: ['Quality assurance vs quality control', 'Verification vs validation', 'Testing levels (unit, integration, system, acceptance)', 'Black-box & white-box testing', 'Test case design (boundary, equivalence)', 'Defect life cycle', 'Quality standards (ISO, CMMI)', 'Software metrics'],
    notes: ['Verification = "are we building it right?"; Validation = "are we building the right thing?".', 'Black-box tests behaviour; white-box tests internal logic/paths.', 'Equivalence partitioning + boundary value analysis reduce test cases efficiently.', 'You cannot test quality in at the end — build it in throughout.'],
    examPrep: ['Design black-box test cases using boundary value analysis.', 'Explain the difference between QA and QC, V&V.', 'Walk through the defect life cycle.'],
    keywords: ['quality', 'testing', 'qa', 'verification', 'validation', 'black box', 'white box', 'defect', 'metrics', 'sqe'],
  },
  {
    code: 'SEN456', title: 'Software Design and Architecture', semester: 8, credits: 3,
    short: 'Structuring large systems with patterns and architecture styles.',
    detailed: 'Teaches how to design software at scale: applying design principles, well-known design patterns, and architectural styles to build systems that are maintainable, scalable and robust.',
    topics: ['Design principles (SOLID, DRY, KISS)', 'Coupling & cohesion', 'Design patterns (creational, structural, behavioural)', 'Architectural styles (layered, MVC, microservices, client–server)', 'UML design diagrams', 'Architecture documentation', 'Quality attributes (scalability, maintainability)'],
    notes: ['SOLID: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.', 'Low coupling + high cohesion = good design.', 'MVC separates data (Model), UI (View) and logic (Controller).', 'Patterns: Singleton, Factory (creational); Adapter, Decorator (structural); Observer, Strategy (behavioural).'],
    examPrep: ['Explain each SOLID principle with an example.', 'Pick a suitable design pattern for a described problem.', 'Draw the MVC / layered architecture for an app.'],
    keywords: ['design', 'architecture', 'solid', 'design patterns', 'mvc', 'microservices', 'coupling', 'cohesion', 'singleton'],
  },
  {
    code: 'SEN455', title: 'Software Project Management', semester: 8, credits: 3,
    short: 'Planning, scheduling and leading software projects.',
    detailed: 'Covers how software projects are estimated, scheduled, staffed and tracked, including risk management, cost estimation and the people/process side of delivering on time and budget.',
    topics: ['Project planning & scope', 'Effort & cost estimation (COCOMO, function points)', 'Scheduling (Gantt, CPM, PERT)', 'Risk management', 'Team organization', 'Configuration management', 'Monitoring & control', 'Agile project management'],
    notes: ['The classic triple constraint: scope, time, cost (quality in the middle).', 'Critical path = longest path through the schedule; it determines minimum duration.', 'Identify, analyse, plan, monitor risks — continuously.', 'Brooks’ Law: adding people to a late project makes it later.'],
    examPrep: ['Draw a network diagram and find the critical path (CPM).', 'Estimate effort using a basic COCOMO formula.', 'Build a simple Gantt chart and risk register.'],
    keywords: ['project management', 'cocomo', 'gantt', 'critical path', 'pert', 'risk', 'estimation', 'spm', 'scheduling'],
  },
];

/* Build a compact text digest of the whole library for the AI context.
   Keeps the prompt small while still letting the AI answer study questions. */
function libraryDigest() {
  return COURSE_LIBRARY.map(c =>
    `${c.code} — ${c.title} (sem ${c.semester || 'elective'}, ${c.credits}cr): ${c.short} Topics: ${c.topics.slice(0, 6).join(', ')}.`
  ).join('\n');
}

/* expose */
window.COURSE_LIBRARY = COURSE_LIBRARY;
window.libraryDigest = libraryDigest;
