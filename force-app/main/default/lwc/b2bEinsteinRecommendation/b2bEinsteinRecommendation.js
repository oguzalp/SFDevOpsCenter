import getEinsteinRecommendation from '@salesforce/apex/CommerceService.getEinsteinRecommendation';
import { LightningElement,api,wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { recommendationSampleData } from "./testData"

export default class B2bEinsteinRecommendation extends LightningElement {
  static renderMode = 'light';
  /**api variables */
  @api recordId;  
  @api recommender;
  @api maxSize;
  @api title;
  @api height;
  @api perPage;

  _productData;

  @api 
  get productDataBinding(){
    return this._productData;
  }

  set productDataBinding(value){
    console.log('productDataBindingSet....');
    console.log(JSON.stringify(value));
    this._productData = value;
  }

  @wire(SessionContextAdapter)
  wiredSessionContext;

  get sessionData(){
    return this.wiredSessionContext?.data;
  }

  @wire(getEinsteinRecommendation, {
      recommender: '$recommender',
      anchorValues: '$recordId',
      cookie: document.cookie
    })wiredGetEinsteinRecommendation;

  
  get recomData(){
    const {error,data} = this.wiredGetEinsteinRecommendation;
    if(error){
      console.error('wiredGetEinsteinRecommendation.error:>>', this.wiredGetEinsteinRecommendation.error)
      return {};
    }
    if(data){
      return JSON.parse(data);
    }
    return {};
  }

  get previewData(){
    return recommendationSampleData;
  }
}