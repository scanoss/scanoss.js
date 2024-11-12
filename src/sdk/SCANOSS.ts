import { Transport } from '../api/transport';
import { Http } from '../api/transport/Http';
import { DependencyModule } from '../modules/Dependency.module';
import { VulnerabilityModule } from "../modules/Vulnerability.module";

export class SCANOSS {
  public readonly dependencies: DependencyModule;
  public readonly vulnerability: VulnerabilityModule;

  private transport: Transport;

  constructor({transport } : {transport?: Transport} = {}) {
    if (transport == null) this.transport = new Http();

    // Initialize modules
    this.dependencies = new DependencyModule({transport: this.transport});
    this.vulnerability = new VulnerabilityModule({transport: this.transport});
  }

}
