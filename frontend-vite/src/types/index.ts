export interface Property {
    propertyId: number;
    metadataCID: string
    tokenPrice: bigint;
    tokensSold: bigint;
    totalDividends: bigint;
    totalTokens: bigint;
    owner: string;
    isActive: boolean;
    dividendPayout?: string;
    expectedReturn?: string;
    totalWithdrawn?: bigint;
}
  
export interface PropertyMetaData {
    propertyName: string,
    location: string,
    description:string,
    images: string
}

export interface CombinedProperty extends PropertyMetaData {
    propertyId: number;
    totalTokens: bigint;
    tokenPrice: bigint;
    totalDividends: bigint;
    owner: string;
    isActive: boolean;
    metadataCID: string;
}