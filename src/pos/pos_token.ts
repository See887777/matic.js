import { BaseToken, Web3SideChainClient, promiseResolve } from "../utils";
import { IBaseClientConfig, IContractInitParam, IPOSClientConfig } from "../interfaces";
import { RootChainManager } from "./root_chain_manager";
import { ExitUtil } from "./exit_util";
import { IPOSContracts } from "../interfaces";

export class POSToken extends BaseToken<IPOSClientConfig> {

    private predicateAddress: string;

    constructor(
        contractParam: IContractInitParam,
        client: Web3SideChainClient<IPOSClientConfig>,
        protected getPOSContracts: () => IPOSContracts
    ) {
        super(contractParam, client);
    }

    get rootChainManager() {
        const contracts = this.getPOSContracts();
        console.log("contracts", contracts);
        return contracts.rootChainManager;
    }

    get exitUtil() {
        const contracts = this.getPOSContracts();
        console.log("contracts", contracts);
        return contracts.exitUtil;
    }


    async getPredicateAddress() {
        if (this.predicateAddress) {
            return promiseResolve(this.predicateAddress);
        }
        const method = await this.rootChainManager.method("tokenToType", this.contractParam.address);
        const tokenType = await method.read();
        if (!tokenType) {
            throw new Error('Invalid Token Type');
        }
        const typeToPredicateMethod = await this.rootChainManager.method
            (
                "typeToPredicate", tokenType
            );
        const predicateAddress = await typeToPredicateMethod.read<string>();
        this.predicateAddress = predicateAddress;
        return predicateAddress;
    }
}