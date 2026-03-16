export type Severity = "critical" | "high" | "medium" | "low";
export type NodeStatus = "healthy" | "warning" | "critical";

export interface InfraNode {
  id: string;
  name: string;
  status: NodeStatus;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

export interface FailurePrediction {
  service: string;
  probability: number;
  estimatedFailure: string;
  reason: string;
  severity: Severity;
}

export interface CostWaste {
  resource: string;
  type: string;
  idleDays: number;
  monthlyCost: number;
  recommendation: string;
}

export interface SecurityRisk {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  resource: string;
  detected: string;
}

export interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
  network: number;
}

export interface TrendInfo {
  trend: "rising" | "falling" | "stable";
  rate: number;
  current: number;
  eta_hours: number | null;
}

export interface ScanResult {
  nodes: InfraNode[];
  predictions: FailurePrediction[];
  costWaste: CostWaste[];
  securityRisks: SecurityRisk[];
  metrics: MetricPoint[];
  trend: TrendInfo;
  aiSummary: string;
  agentLog: { task_type: string; affected_resource: string; action_taken: string; timestamp: string }[];
  fixedTasks: string[];
  summary: {
    healthyNodes: number;
    warningNodes: number;
    criticalNodes: number;
    totalWaste: number;
    criticalRisks: number;
  };
}
