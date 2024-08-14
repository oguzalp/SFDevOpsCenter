import { LightningElement,api,wire,track } from 'lwc';
import SplideJs from "@salesforce/resourceUrl/SplideJS";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import { navigate, NavigationContext } from 'lightning/navigation';

export default class B2bProductRecommendation extends LightningElement {
  static renderMode = 'light';

  @api recommender; 

  @api recomData;

  @api previewData;
  
  @api anchorId;

  @api maxSize;

  @api session;
  
  @api title;

  @api height;

  @api perPage;

  _navigationContext;
  _isResourceLoaded = false;

  get splideConfigurations(){
    return {
      type: 'loop',
      gap: '1rem',
      perPage: this.perPage ?? 4,
      breakpoints: {
        640: {
          perPage: 2,
        }
      },
      padding: '1rem', 
      rewind: false,
      pagination: true, 
    }
  }

  @wire(NavigationContext)
  wiredNavigationContext(context) {
      this._navigationContext = context;
  }

  get header(){
    return this.title;
  }

  get recommenderMethod(){
    return this.recommender;
  }

  get recordDataId(){
    return this.anchorId;
  }


  get einsteinProducts(){
    if(this.session?.isPreview){
      return this.previewData?.productPage;
    }   
    if(this.recomData?.productPage){

      return this.recomData?.productPage;
    }
    return null;
  }

  get hasProducts(){
    if(this.einsteinProducts?.products?.length > 0){
      return true;
    }
    return false;
  }


  async renderedCallback(){     
    if(!this._isResourceLoaded){
      try {
        await Promise.all([loadStyle(this, SplideJs + '/css/splide.min.css'), loadScript(this, SplideJs + '/js/splide.min.js')]);
        this._isResourceLoaded = true;
      } catch (error) {   
        console.error('JSResource not loaded :>>' , error);     
      }
    }

    if(this.querySelectorAll('.splide__slide').length > 0 && window.Splide){
      console.log('isLoaded && and slides exist.& initializing the splider..');
      this.initalizeSplide();
    }
  }

  initalizeSplide(){
    const sp = new Splide('.splide',this.splideConfigurations);
    sp.mount();
    console.log('Splide initialized!');
  }

  goToProductDetail(event){
    event.preventDefault();
    event.stopPropagation();
    const productId = event.target.dataset?.id;
    console.log('Product id:>>>' , productId);
    const pageRef = {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: productId,
        actionName: 'view',
      }
    };
    navigate( this._navigationContext, pageRef );
  }

}