public inherited sharing class CommerceService {
    
    public static String API_VERSION = 'v59.0';
    static final String GET_METHOD = 'GET';
    static final String COOKIE_HEADER = 'Cookie';
    static final String AUTH_HEADER = 'Authorization';

    static Set<String> noAnchorRecommendations = new Set<String>{
        'recentlyviewed', 
        'topselling', 
        'personalizedforshopper'
    };

    /**
     - No anchor: Any value that evaluates to false. For example: null or undefined.	
        RecentlyViewed
        TopSelling
        PersonalizedForShopper
     - Product ID: A list of one or more 18-character product IDs. For example: 01t000000000000001, 01t000000000000002, 01t000000000000003	
        RecentlyViewed
        SimilarProducts
        ComplementaryProducts
        CustomersWhooughtAlsoBought
        Upsell
    - Category ID: A list of one or more 18-character category IDs. For example: 0ZG000000000000001, 0ZG000000000000002, 0ZG000000000000003	
        RecentlyViewed
        MostViewedByCategory
        TopSellingByCategory
    */
    @AuraEnabled(cacheable=true)
    public static String getEinsteinRecommendation(String recommender, String anchorValues, String cookie) {
        String orgDomain = System.Url.getOrgDomainUrl().toExternalForm();
        try{
            String webstoreId = getWebStoreId();
            if(String.isBlank(webstoreId)){
                throw new AuraHandledException('webstoreid can not be blank!');
            }
            if(!validateAnchorValues(recommender, anchorValues)){
                throw new AuraHandledException('Bad Request!. given parameters are not valid!');
            }
            String endpoint = orgDomain + '/services/data/'+ API_VERSION+ '/commerce/webstores/'
                + webstoreId
                +'/ai/recommendations?language=en-US&recommender=' 
                + recommender ; 

            if (String.isNotBlank(anchorValues) && anchorValues.length() > 0) {
                endpoint += '&anchorValues='+anchorValues;
            }
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setHeader(COOKIE_HEADER, cookie);
            req.setMethod(GET_METHOD);
            req.setHeader(AUTH_HEADER, 'OAuth ' + UserInfo.getSessionId());
            
            Http http = new Http();
            HTTPResponse res = http.send(req);
            System.debug('Response:>>' + res.getBody());
            return res.getBody();
        }catch(AuraHandledException ex){
            throw ex;
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }

    static Boolean validateAnchorValues(String recommender, String anchorValues){
        if(String.isBlank(anchorValues)){
            if(noAnchorRecommendations.contains(recommender.toLowerCase())) return true;
            else return false;
        }else{
            String anchorId = anchorValues.contains(',') ? anchorValues.split(',')[0] : anchorValues;
            try{
               String idObjectName = Id.valueOf(anchorId).getSobjectType().getDescribe().getName();
               if(idObjectName == Product2.getSObjectType().getDescribe().getName() || idObjectName == ProductCategory.getSObjectType().getDescribe().getName() ){
                    return true;
               }else return false;
            }catch(Exception e){
                return false;
            }
        } 
    }

    @AuraEnabled
    public static String getWebStoreId(){
        String networkId = Network.getNetworkId();
        if(String.isBlank(networkId)) return null;
        String webstoreId;
        try {
            webStoreId = [
                SELECT WebStoreId
                FROM WebStoreNetwork
                WHERE NetworkId = :networkId
                LIMIT 1
            ].WebStoreId;
        } catch (Exception e) {
            System.debug('Exception.getWebstoreId:>> '+ e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return webstoreId;
    }

}