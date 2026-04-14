import Map "mo:core/Map";
import List "mo:core/List";
import Common "types/common";
import ProfileTypes "types/profile";
import ChatTypes "types/chat";
import KnowledgeTypes "types/knowledge";
import QuizTypes "types/quiz";
import KnowledgeLib "lib/knowledge";
import QuizLib "lib/quiz";
import ProfileMixin "mixins/profile-api";
import ChatMixin "mixins/chat-api";
import KnowledgeMixin "mixins/knowledge-api";
import QuizMixin "mixins/quiz-api";

actor {
  // Profile state
  let profileStore = Map.empty<Common.UserId, ProfileTypes.StudentProfile>();
  include ProfileMixin(profileStore);

  // Chat state
  let messageStore = Map.empty<Common.UserId, List.List<ChatTypes.ChatMessage>>();
  let summaryStore = Map.empty<Common.SessionId, ChatTypes.SessionSummary>();
  let messageIdCounter = [var 0];
  include ChatMixin(messageStore, summaryStore, messageIdCounter);

  // Knowledge / progress state
  let topicStore = Map.empty<Common.TopicId, KnowledgeTypes.Topic>();
  let progressStore = Map.empty<Common.UserId, Map.Map<Common.TopicId, KnowledgeTypes.TopicProgress>>();
  let factIdCounter = [var 0];
  include KnowledgeMixin(topicStore, progressStore, factIdCounter);

  // Quiz state
  let questionStore = Map.empty<Common.QuizId, List.List<QuizTypes.QuizQuestion>>();
  let attemptStore = Map.empty<Common.UserId, List.List<QuizTypes.QuizAttempt>>();
  let questionIdCounter = [var 0];
  let attemptIdCounter = [var 0];
  include QuizMixin(questionStore, attemptStore, questionIdCounter, attemptIdCounter, topicStore, progressStore);

  // ── Seed knowledge base ──────────────────────────────────────────────────
  func seedTopics() {
    // Math
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "math-arithmetic";
      name = "Basic Arithmetic";
      description = "Addition, subtraction, multiplication, and division — the building blocks of math!";
      subject = "Math";
      difficulty = #beginner;
      prerequisites = [];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "math-fractions";
      name = "Fractions";
      description = "Understanding parts of a whole — numerators, denominators, and how to work with them.";
      subject = "Math";
      difficulty = #beginner;
      prerequisites = ["math-arithmetic"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "math-algebra";
      name = "Introduction to Algebra";
      description = "Using variables to represent unknowns and solving equations.";
      subject = "Math";
      difficulty = #intermediate;
      prerequisites = ["math-arithmetic", "math-fractions"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "math-geometry";
      name = "Geometry Basics";
      description = "Shapes, angles, area, perimeter, and spatial reasoning.";
      subject = "Math";
      difficulty = #intermediate;
      prerequisites = ["math-arithmetic"];
    });

    // Science
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "sci-scientific-method";
      name = "The Scientific Method";
      description = "How scientists ask questions, form hypotheses, and test them through experiments.";
      subject = "Science";
      difficulty = #beginner;
      prerequisites = [];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "sci-cells";
      name = "Cells: The Building Blocks of Life";
      description = "Cell structure, organelles, and the difference between plant and animal cells.";
      subject = "Science";
      difficulty = #beginner;
      prerequisites = ["sci-scientific-method"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "sci-photosynthesis";
      name = "Photosynthesis";
      description = "How plants convert sunlight, water, and CO₂ into glucose and oxygen.";
      subject = "Science";
      difficulty = #intermediate;
      prerequisites = ["sci-cells"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "sci-newton-laws";
      name = "Newton's Laws of Motion";
      description = "The three fundamental laws that describe how objects move and respond to forces.";
      subject = "Science";
      difficulty = #intermediate;
      prerequisites = ["sci-scientific-method"];
    });

    // History
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "hist-ancient-egypt";
      name = "Ancient Egypt";
      description = "The civilization along the Nile — pharaohs, pyramids, hieroglyphics, and daily life.";
      subject = "History";
      difficulty = #beginner;
      prerequisites = [];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "hist-world-war-2";
      name = "World War II";
      description = "The causes, major events, key figures, and outcome of the Second World War (1939–1945).";
      subject = "History";
      difficulty = #intermediate;
      prerequisites = [];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "hist-american-revolution";
      name = "The American Revolution";
      description = "How the thirteen colonies broke free from British rule and formed the United States.";
      subject = "History";
      difficulty = #intermediate;
      prerequisites = [];
    });

    // Programming
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "prog-variables";
      name = "Variables and Data Types";
      description = "Storing and labeling information in programs — numbers, text, and booleans.";
      subject = "Programming";
      difficulty = #beginner;
      prerequisites = [];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "prog-loops";
      name = "Loops and Iteration";
      description = "Making the computer repeat tasks efficiently using for, while, and other loops.";
      subject = "Programming";
      difficulty = #beginner;
      prerequisites = ["prog-variables"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "prog-functions";
      name = "Functions and Reusability";
      description = "Grouping code into reusable blocks that take input and return output.";
      subject = "Programming";
      difficulty = #intermediate;
      prerequisites = ["prog-variables", "prog-loops"];
    });
    ignore KnowledgeLib.addTopic(topicStore, {
      id = "prog-data-structures";
      name = "Arrays and Lists";
      description = "Organizing multiple values together and working with collections of data.";
      subject = "Programming";
      difficulty = #intermediate;
      prerequisites = ["prog-loops", "prog-functions"];
    });
  };

  func seedFacts() {
    // Arithmetic facts
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "math-arithmetic"; factText = "The order of operations (PEMDAS/BODMAS): Parentheses, Exponents, Multiply/Divide, Add/Subtract."; tags = ["operations", "order"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "math-arithmetic"; factText = "Any number multiplied by 0 equals 0."; tags = ["multiplication", "zero"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "math-arithmetic"; factText = "Division by zero is undefined."; tags = ["division", "zero"] });

    // Algebra facts
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "math-algebra"; factText = "A variable is a letter that represents an unknown number, like x or y."; tags = ["variable", "unknown"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "math-algebra"; factText = "To solve for x in '2x = 10', divide both sides by 2 to get x = 5."; tags = ["solving", "equation"] });

    // Cells facts
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-cells"; factText = "The nucleus is the control center of the cell, containing DNA."; tags = ["nucleus", "DNA"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-cells"; factText = "Mitochondria produce energy for the cell through cellular respiration — often called the powerhouse of the cell."; tags = ["mitochondria", "energy"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-cells"; factText = "Plant cells have a cell wall and chloroplasts; animal cells do not."; tags = ["plant", "animal", "difference"] });

    // Newton's Laws facts
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-newton-laws"; factText = "First Law (Inertia): An object at rest stays at rest; an object in motion stays in motion, unless acted on by a force."; tags = ["inertia", "first-law"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-newton-laws"; factText = "Second Law: Force = Mass × Acceleration (F = ma)."; tags = ["force", "acceleration", "second-law"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "sci-newton-laws"; factText = "Third Law: For every action, there is an equal and opposite reaction."; tags = ["reaction", "third-law"] });

    // Programming facts
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "prog-variables"; factText = "Common data types include: Integer (whole numbers), Float (decimals), String (text), Boolean (true/false)."; tags = ["types", "data"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "prog-loops"; factText = "A for loop repeats a block of code a specific number of times."; tags = ["for", "iteration"] });
    ignore KnowledgeLib.addFact(topicStore, factIdCounter, { topicId = "prog-functions"; factText = "A function with a return statement gives back a value to the caller."; tags = ["return", "output"] });
  };

  func seedQuizzes() {
    // Math Arithmetic Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-arithmetic";
      topicId = "math-arithmetic";
      questionText = "What is 7 × 8?";
      questionType = #multipleChoice;
      choices = ["54", "56", "48", "64"];
      correctAnswer = "56";
      explanation = "7 × 8 = 56. You can think of it as 7 × 8 = (7 × 4) × 2 = 28 × 2 = 56! 🎯";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-arithmetic";
      topicId = "math-arithmetic";
      questionText = "What is the result of 12 + 15 - 7?";
      questionType = #multipleChoice;
      choices = ["18", "20", "22", "24"];
      correctAnswer = "20";
      explanation = "12 + 15 = 27, then 27 - 7 = 20. Work left to right! ✨";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-arithmetic";
      topicId = "math-arithmetic";
      questionText = "What is 144 ÷ 12?";
      questionType = #multipleChoice;
      choices = ["10", "11", "12", "13"];
      correctAnswer = "12";
      explanation = "144 ÷ 12 = 12. You can check: 12 × 12 = 144! 🌟";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-arithmetic";
      topicId = "math-arithmetic";
      questionText = "According to order of operations, what is 2 + 3 × 4?";
      questionType = #multipleChoice;
      choices = ["20", "14", "12", "24"];
      correctAnswer = "14";
      explanation = "Multiplication comes before addition! First 3 × 4 = 12, then 2 + 12 = 14. Remember PEMDAS! 📚";
    });

    // Algebra Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-algebra";
      topicId = "math-algebra";
      questionText = "If 3x = 15, what is x?";
      questionType = #multipleChoice;
      choices = ["3", "4", "5", "6"];
      correctAnswer = "5";
      explanation = "Divide both sides by 3: x = 15 ÷ 3 = 5. Always do the same thing to both sides! ⚖️";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-algebra";
      topicId = "math-algebra";
      questionText = "What does the variable 'x' represent in an equation?";
      questionType = #multipleChoice;
      choices = ["A specific number", "An unknown value", "The letter x", "Multiplication"];
      correctAnswer = "An unknown value";
      explanation = "A variable like 'x' is a placeholder for an unknown number we're trying to find! 🔍";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-algebra";
      topicId = "math-algebra";
      questionText = "Simplify: 2x + 3x";
      questionType = #multipleChoice;
      choices = ["5", "5x", "6x", "2x3x"];
      correctAnswer = "5x";
      explanation = "Like terms can be combined! 2x + 3x = (2+3)x = 5x. Think of 'x' like apples: 2 apples + 3 apples = 5 apples! 🍎";
    });

    // Science - Cells Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-cells";
      topicId = "sci-cells";
      questionText = "What is the control center of the cell?";
      questionType = #multipleChoice;
      choices = ["Mitochondria", "Cell membrane", "Nucleus", "Ribosome"];
      correctAnswer = "Nucleus";
      explanation = "The nucleus contains the cell's DNA and controls all cell activities. It's the boss! 👑";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-cells";
      topicId = "sci-cells";
      questionText = "Which organelle is called the 'powerhouse of the cell'?";
      questionType = #multipleChoice;
      choices = ["Nucleus", "Chloroplast", "Ribosome", "Mitochondria"];
      correctAnswer = "Mitochondria";
      explanation = "Mitochondria produce ATP (energy) through cellular respiration — powering everything the cell does! ⚡";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-cells";
      topicId = "sci-cells";
      questionText = "Which structure is found in plant cells but NOT in animal cells?";
      questionType = #multipleChoice;
      choices = ["Nucleus", "Cell membrane", "Cell wall", "Mitochondria"];
      correctAnswer = "Cell wall";
      explanation = "Plant cells have a rigid cell wall made of cellulose for extra support. Animal cells only have a flexible cell membrane! 🌿";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-cells";
      topicId = "sci-cells";
      questionText = "What does the cell membrane do?";
      questionType = #multipleChoice;
      choices = ["Produces energy", "Controls what enters and exits the cell", "Stores genetic information", "Makes proteins"];
      correctAnswer = "Controls what enters and exits the cell";
      explanation = "The cell membrane acts like a gatekeeper, letting nutrients in and waste out! 🚪";
    });

    // Newton's Laws Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-newton";
      topicId = "sci-newton-laws";
      questionText = "Newton's First Law is about which concept?";
      questionType = #multipleChoice;
      choices = ["Gravity", "Inertia", "Acceleration", "Friction"];
      correctAnswer = "Inertia";
      explanation = "Inertia is the tendency of objects to resist changes in their motion — a resting ball won't roll unless you push it! 🎱";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-newton";
      topicId = "sci-newton-laws";
      questionText = "According to F = ma, if mass doubles and force stays the same, what happens to acceleration?";
      questionType = #multipleChoice;
      choices = ["It doubles", "It stays the same", "It halves", "It quadruples"];
      correctAnswer = "It halves";
      explanation = "a = F/m. If m doubles and F stays constant, a = F/(2m) = half the original acceleration! 📐";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-newton";
      topicId = "sci-newton-laws";
      questionText = "A rocket launches by pushing gas downward. Which law explains this?";
      questionType = #multipleChoice;
      choices = ["First Law", "Second Law", "Third Law", "Law of Gravity"];
      correctAnswer = "Third Law";
      explanation = "For every action (gas pushed down), there is an equal and opposite reaction (rocket pushed up)! 🚀";
    });

    // Programming Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-programming";
      topicId = "prog-variables";
      questionText = "Which data type would you use to store the text 'Hello, World!'?";
      questionType = #multipleChoice;
      choices = ["Integer", "Boolean", "Float", "String"];
      correctAnswer = "String";
      explanation = "Strings store text! They're usually written inside quotes like 'Hello' or \"World\". 📝";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-programming";
      topicId = "prog-loops";
      questionText = "What type of loop runs a specific number of times?";
      questionType = #multipleChoice;
      choices = ["While loop", "Do-while loop", "For loop", "Infinite loop"];
      correctAnswer = "For loop";
      explanation = "A for loop is perfect when you know exactly how many times to repeat — like 'do this 10 times'! 🔄";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-programming";
      topicId = "prog-functions";
      questionText = "What is the main benefit of using functions in programming?";
      questionType = #multipleChoice;
      choices = ["They make programs slower", "They allow code reuse and organization", "They are required by all languages", "They only work with numbers"];
      correctAnswer = "They allow code reuse and organization";
      explanation = "Functions let you write code once and use it many times — the DRY principle: Don't Repeat Yourself! ♻️";
    });

    // History Quiz
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-egypt";
      topicId = "hist-ancient-egypt";
      questionText = "What river was central to ancient Egyptian civilization?";
      questionType = #multipleChoice;
      choices = ["Amazon", "Tigris", "Nile", "Mississippi"];
      correctAnswer = "Nile";
      explanation = "The Nile River provided water, fertile soil, and a transportation route — it was the lifeblood of ancient Egypt! 🌊";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-egypt";
      topicId = "hist-ancient-egypt";
      questionText = "What were the large stone tombs built for Egyptian pharaohs called?";
      questionType = #multipleChoice;
      choices = ["Temples", "Ziggurats", "Pyramids", "Coliseums"];
      correctAnswer = "Pyramids";
      explanation = "The pyramids, like the Great Pyramid of Giza, were massive tombs built for pharaohs to help them in the afterlife! 🏛️";
    });
    ignore QuizLib.addQuestion(questionStore, questionIdCounter, {
      quizId = "quiz-egypt";
      topicId = "hist-ancient-egypt";
      questionText = "What writing system did ancient Egyptians use?";
      questionType = #multipleChoice;
      choices = ["Cuneiform", "Hieroglyphics", "Latin alphabet", "Sanskrit"];
      correctAnswer = "Hieroglyphics";
      explanation = "Hieroglyphics used pictures and symbols to represent words and sounds — a fascinating writing system! ✍️";
    });
  };

  // Run seeding once at canister initialization
  seedTopics();
  seedFacts();
  seedQuizzes();
};
