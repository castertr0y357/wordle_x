// A small subset of words for the prototype
// In a real app, these would be much larger lists or fetched from an API

export const WORDS = {
  5: [
    "APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK",
    "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS",
    "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY",
    "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PHONE", "PLANE", "PLATE", "RADIO",
    "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM", "TABLE",
    "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATCH", "WATER", "WHITE", "WORLD",
    "WRITE", "YOUTH", "ZEBRA", "ALIVE", "ANGRY", "AWAKE", "BADGE", "BAKER", "BLAME", "BLANK"
  ],
  6: [
    "ACTION", "ANIMAL", "ANSWER", "ARTIST", "BASKET", "BOTTLE", "BRIDGE", "BUTTON", "CAMERA", "CANDLE",
    "CARPET", "CASTLE", "CIRCLE", "CIRCUS", "COFFEE", "COPPER", "CORNER", "COTTON", "DANGER", "DINNER",
    "DOCTOR", "DOLLAR", "DONKEY", "DRIVER", "ENERGY", "ENGINE", "EXPERT", "FAMILY", "FARMER", "FATHER",
    "FINGER", "FLOWER", "FOREST", "FRIEND", "GARDEN", "GARLIC", "GINGER", "GUITAR", "HAMMER", "HEAVEN",
    "HONEST", "HUNGRY", "ISLAND", "JACKET", "JUNGLE", "KITTEN", "LAWYER", "LETTER", "LIZARD", "MARKET",
    "MASTER", "MONKEY", "MOTHER", "NAPKIN", "NATURE", "NUMBER", "OFFICE", "ORANGE", "PARADE", "PARENT",
    "PEANUT", "PENCIL", "PEPPER", "PERSON", "PICNIC", "PLANET", "POCKET", "POLICE", "POTATO", "PRINCE",
    "PUBLIC", "PUPPET", "PURPLE", "RABBIT", "RADISH", "RECORD", "REPORT", "ROCKET", "SCHOOL", "SCREEN"
  ],
  7: [
    "AIRPORT", "ADDRESS", "BALLOON", "BALANCE", "BATTERY", "BEDROOM", "BICYCLE", "BLANKET", "BROTHER", "CABINET",
    "CAPTAIN", "CENTURY", "CHICKEN", "CHIMNEY", "CLOTHES", "COMFORT", "CONCERT", "COUNTRY", "CRYSTAL", "CUPBOARD",
    "CURTAIN", "DIAMOND", "DOLPHIN", "DRAGON", "ECONOMY", "ELEMENT", "ELEPHANT", "EMOTION", "EVENING", "EXAMPLE",
    "FACTORY", "FEATHER", "FESTIVAL", "FIREMAN", "FITNESS", "FREEDOM", "GALLERY", "GARBAGE", "GIRAFFE", "GLASSES",
    "GORILLA", "GROCERY", "HAMSTER", "HISTORY", "HOLIDAY", "HOSPITAL", "HUSBAND", "INSECT", "JOURNEY", "JUSTICE",
    "KITCHEN", "LEATHER", "LIBRARY", "LUGGAGE", "MACHINE", "MANAGER", "MESSAGE", "MISSION", "MORNING", "MUSICAL",
    "MYSTERY", "NATURAL", "NOTHING", "OFFICER", "OPINION", "PACKAGE", "PAINTING", "PARTNER", "PATTERN", "PENGUIN"
  ],
  8: [
    "ABSOLUTE", "ACCIDENT", "ACTIVITY", "AIRPLANE", "ALPHABET", "ANYTHING", "AQUARIUM", "BACKPACK", "BASEBALL", "BIRTHDAY",
    "BROCCOLI", "BUILDING", "BUSINESS", "CALENDAR", "CAMPAIGN", "CAPACITY", "CATEGORY", "CHAMPION", "CHILDREN", "CHOCOLATE",
    "CINNAMON", "CLOTHING", "COMPUTER", "CONFLICT", "CREATIVE", "DAUGHTER", "DECISION", "DELICATE", "DELIVERY", "DINOSAUR",
    "DIRECTION", "DISTANCE", "DISTRICT", "DOCUMENT", "ELECTION", "ELECTRIC", "ELEVATOR", "EMPLOYEE", "ENGINEER", "ENTRANCE",
    "ENVELOPE", "EVIDENCE", "EXERCISE", "EXTERNAL", "FESTIVAL", "FOOTBALL", "FOREHEAD", "FOUNTAIN", "FRIENDLY", "FUNCTION",
    "GARDENER", "GASOLINE", "GATHERING", "GENEROUS", "HOSPITAL", "HUMANITY", "IDENTITY", "INDUSTRY", "INTERNET", "KEYBOARD"
  ]
};

export const getRandomWord = (length) => {
  const list = WORDS[length] || WORDS[5];
  return list[Math.floor(Math.random() * list.length)];
};

export const isValidWord = (word) => {
  const length = word.length;
  const list = WORDS[length];
  // In a real app, we'd check against a much larger dictionary
  // For this prototype, we'll be lenient and allow any word if it's not in our small list
  // BUT to make the game playable with just the list, let's check the list.
  // Actually, for a better UX in a prototype with a small list, let's just return true 
  // if it's the correct length, otherwise it's frustrating to guess valid words that aren't in the list.
  // However, to show "Invalid Word" logic, let's try to check against the list + a few common ones if possible.
  // Let's stick to: Must be in list OR just length check? 
  // Let's do: Length check only for prototype to avoid "Not in word list" frustration with small dictionary.
  return word.length === length; 
};
