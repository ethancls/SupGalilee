// HAZOP Node Templates - Common process equipment types

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: string;
  color: string;
  defaultParameters: string[];
  defaultDesignIntent: string;
}

export const NODE_CATEGORIES = [
  { id: "vessels", name: "Vessels & Tanks", color: "#3b82f6" },
  { id: "heat-transfer", name: "Heat Transfer", color: "#ef4444" },
  { id: "fluid-handling", name: "Fluid Handling", color: "#22c55e" },
  { id: "separation", name: "Separation", color: "#a855f7" },
  { id: "control", name: "Control & Safety", color: "#f59e0b" },
  { id: "reaction", name: "Reaction Systems", color: "#ec4899" },
] as const;

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Vessels & Tanks
  {
    id: "vessel",
    name: "Pressure Vessel",
    description: "Closed container designed to hold gases or liquids at a pressure different from ambient",
    icon: "Container",
    category: "vessels",
    color: "#3b82f6",
    defaultParameters: ["Pressure", "Temperature", "Level", "Flow"],
    defaultDesignIntent: "To contain process fluid at designed pressure and temperature conditions",
  },
  {
    id: "storage-tank",
    name: "Storage Tank",
    description: "Atmospheric or low-pressure tank for bulk storage of liquids",
    icon: "Database",
    category: "vessels",
    color: "#3b82f6",
    defaultParameters: ["Level", "Temperature", "Composition"],
    defaultDesignIntent: "To store process fluid at atmospheric or low pressure conditions",
  },
  {
    id: "drum",
    name: "Drum / Accumulator",
    description: "Vessel for liquid accumulation, surge control, or phase separation",
    icon: "Cylinder",
    category: "vessels",
    color: "#3b82f6",
    defaultParameters: ["Level", "Pressure", "Flow"],
    defaultDesignIntent: "To provide surge capacity and maintain steady downstream flow",
  },
  
  // Heat Transfer
  {
    id: "heat-exchanger",
    name: "Heat Exchanger",
    description: "Equipment for transferring heat between two fluids",
    icon: "ArrowLeftRight",
    category: "heat-transfer",
    color: "#ef4444",
    defaultParameters: ["Temperature", "Flow", "Pressure", "Fouling"],
    defaultDesignIntent: "To transfer heat from hot stream to cold stream achieving target outlet temperatures",
  },
  {
    id: "cooler",
    name: "Cooler / Condenser",
    description: "Heat exchanger for cooling or condensing process streams",
    icon: "ThermometerSnowflake",
    category: "heat-transfer",
    color: "#ef4444",
    defaultParameters: ["Temperature", "Flow", "Pressure", "Cooling Water Flow"],
    defaultDesignIntent: "To reduce process temperature or condense vapors",
  },
  {
    id: "heater",
    name: "Heater / Reboiler",
    description: "Equipment for heating process streams or vaporizing liquids",
    icon: "Flame",
    category: "heat-transfer",
    color: "#ef4444",
    defaultParameters: ["Temperature", "Flow", "Pressure", "Steam Flow"],
    defaultDesignIntent: "To increase process temperature or provide heat for vaporization",
  },
  {
    id: "furnace",
    name: "Fired Heater / Furnace",
    description: "Direct-fired heating equipment for high-temperature processes",
    icon: "Flame",
    category: "heat-transfer",
    color: "#ef4444",
    defaultParameters: ["Temperature", "Flow", "Fuel Flow", "Air Flow", "Stack Temperature"],
    defaultDesignIntent: "To provide high-temperature heating through combustion",
  },
  
  // Fluid Handling
  {
    id: "pump",
    name: "Pump",
    description: "Equipment for moving liquids through piping systems",
    icon: "CircleDot",
    category: "fluid-handling",
    color: "#22c55e",
    defaultParameters: ["Flow", "Pressure", "NPSH", "Speed"],
    defaultDesignIntent: "To transfer liquid at required flow rate and develop necessary pressure",
  },
  {
    id: "compressor",
    name: "Compressor",
    description: "Equipment for compressing gases to higher pressures",
    icon: "Gauge",
    category: "fluid-handling",
    color: "#22c55e",
    defaultParameters: ["Flow", "Pressure", "Temperature", "Speed", "Vibration"],
    defaultDesignIntent: "To increase gas pressure to required operating conditions",
  },
  {
    id: "valve",
    name: "Control Valve",
    description: "Valve for controlling flow, pressure, or level",
    icon: "SlidersHorizontal",
    category: "fluid-handling",
    color: "#22c55e",
    defaultParameters: ["Flow", "Pressure Drop", "Position"],
    defaultDesignIntent: "To regulate process variable by adjusting flow through the valve",
  },
  {
    id: "pipeline",
    name: "Pipeline Section",
    description: "Piping section for fluid transport between equipment",
    icon: "Minus",
    category: "fluid-handling",
    color: "#22c55e",
    defaultParameters: ["Flow", "Pressure", "Temperature", "Velocity"],
    defaultDesignIntent: "To transport process fluid between equipment safely",
  },
  
  // Separation
  {
    id: "distillation",
    name: "Distillation Column",
    description: "Column for separating components based on boiling points",
    icon: "FlaskConical",
    category: "separation",
    color: "#a855f7",
    defaultParameters: ["Pressure", "Temperature", "Level", "Reflux Ratio", "Composition"],
    defaultDesignIntent: "To separate feed into overhead and bottoms products at required purity",
  },
  {
    id: "separator",
    name: "Separator",
    description: "Vessel for separating phases (liquid/gas, oil/water)",
    icon: "Layers",
    category: "separation",
    color: "#a855f7",
    defaultParameters: ["Pressure", "Level", "Interface Level", "Flow"],
    defaultDesignIntent: "To separate incoming stream into individual phases",
  },
  {
    id: "filter",
    name: "Filter / Strainer",
    description: "Equipment for removing solid particles from fluids",
    icon: "Filter",
    category: "separation",
    color: "#a855f7",
    defaultParameters: ["Flow", "Pressure Drop", "Differential Pressure"],
    defaultDesignIntent: "To remove solid contaminants from process stream",
  },
  
  // Control & Safety
  {
    id: "relief-valve",
    name: "Relief Valve / PSV",
    description: "Pressure relief device for overpressure protection",
    icon: "ShieldAlert",
    category: "control",
    color: "#f59e0b",
    defaultParameters: ["Set Pressure", "Relieving Capacity"],
    defaultDesignIntent: "To protect equipment from overpressure by relieving excess pressure",
  },
  {
    id: "control-loop",
    name: "Control Loop",
    description: "Instrumentation loop for process control",
    icon: "Activity",
    category: "control",
    color: "#f59e0b",
    defaultParameters: ["Setpoint", "Process Variable", "Controller Output"],
    defaultDesignIntent: "To maintain process variable at setpoint through automatic control",
  },
  {
    id: "esd-system",
    name: "ESD System",
    description: "Emergency shutdown system for process safety",
    icon: "OctagonX",
    category: "control",
    color: "#f59e0b",
    defaultParameters: ["Trip Setpoint", "Response Time"],
    defaultDesignIntent: "To safely shutdown process on detection of hazardous conditions",
  },
  
  // Reaction Systems
  {
    id: "reactor",
    name: "Reactor",
    description: "Vessel where chemical reactions take place",
    icon: "FlaskRound",
    category: "reaction",
    color: "#ec4899",
    defaultParameters: ["Temperature", "Pressure", "Residence Time", "Conversion", "Catalyst Activity"],
    defaultDesignIntent: "To convert reactants to products under controlled conditions",
  },
  {
    id: "mixer",
    name: "Mixer / Agitator",
    description: "Equipment for mixing or blending materials",
    icon: "Blend",
    category: "reaction",
    color: "#ec4899",
    defaultParameters: ["Speed", "Power", "Mixing Time"],
    defaultDesignIntent: "To achieve homogeneous mixture of process streams",
  },
];

// HAZOP Guide Words with descriptions
export const GUIDE_WORDS = [
  {
    word: "NO",
    aliases: ["NONE", "NOT"],
    description: "Complete negation of design intent",
    examples: ["No flow", "No pressure", "No level"],
  },
  {
    word: "MORE",
    aliases: ["HIGH", "HIGHER"],
    description: "Quantitative increase above normal",
    examples: ["More flow", "High temperature", "High pressure"],
  },
  {
    word: "LESS",
    aliases: ["LOW", "LOWER"],
    description: "Quantitative decrease below normal",
    examples: ["Less flow", "Low temperature", "Low pressure"],
  },
  {
    word: "REVERSE",
    aliases: ["BACKWARD"],
    description: "Opposite direction or action",
    examples: ["Reverse flow", "Backflow"],
  },
  {
    word: "AS WELL AS",
    aliases: ["ALSO", "CONTAMINATION"],
    description: "Additional component or activity",
    examples: ["Impurities present", "Additional phase", "Contamination"],
  },
  {
    word: "PART OF",
    aliases: ["INCOMPLETE"],
    description: "Only part of design intent achieved",
    examples: ["Partial flow", "Incomplete reaction", "Partial separation"],
  },
  {
    word: "OTHER THAN",
    aliases: ["WRONG", "DIFFERENT"],
    description: "Complete substitution",
    examples: ["Wrong material", "Different composition"],
  },
  {
    word: "EARLY",
    aliases: ["SOON", "BEFORE"],
    description: "Timing - event occurs earlier than intended",
    examples: ["Premature startup", "Early activation"],
  },
  {
    word: "LATE",
    aliases: ["DELAYED", "AFTER"],
    description: "Timing - event occurs later than intended",
    examples: ["Delayed response", "Late shutdown"],
  },
  {
    word: "FLUCTUATION",
    aliases: ["UNSTABLE", "VARYING"],
    description: "Irregular or unstable operation",
    examples: ["Fluctuating flow", "Pressure swings", "Temperature cycling"],
  },
];

// Common HAZOP parameters
export const HAZOP_PARAMETERS = [
  "Flow",
  "Pressure",
  "Temperature",
  "Level",
  "Composition",
  "pH",
  "Viscosity",
  "Density",
  "Speed",
  "Time",
  "Frequency",
  "Voltage",
  "Current",
  "Signal",
  "Reaction",
  "Mixing",
  "Separation",
  "Information",
];
