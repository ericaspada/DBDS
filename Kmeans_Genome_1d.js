use GEO
geo = db.GEO

// make a new collection choosing the two samples to compare and the list of 10 gene probes
var target1 = 'icSARS' // sample we are interested in
var target2 = 'Mock' // control (mock infection)
var probes_list = ['$A_23_P100177', '$A_23_P100196', '$A_23_P100156', '$A_23_P100315', '$A_23_P100556', '$A_23_P100676',
'$A_23_P100764','$A_23_P111141', '$A_23_P111571', '$A_23_P112726' ] // any number of probes
var time_slices = '48h\\' // any number of time slices
var replicate = 3 // a single replicate (for now until we have averages)

var aggregated = geo.aggregate(
   [{$project: {"FactorValue [INFECTION CODE]":1,'FactorValue [TIME]\\':1,'Characteristics [biological replicate]':1, probeArray: probes_list}},
   {$match: {'FactorValue [TIME]\\':{$in: [time_slices]}}}, 
   {$match: {'FactorValue [INFECTION CODE]': {$in: [target1, target2]}}},
   {$match: {'Characteristics [biological replicate]':{$in: [replicate]}}}
   //{$group: {_id: {code:"$FactorValue [INFECTION CODE]", time:'$FactorValue [TIME]\\'}},
    // probeAvg: {$avg: '$probeArray'}} // take the average of the 3 replicates
   ]
).toArray()
aggregated // TO DO: OUTPUT THIS TO A NEW COLLECTION 
   
/// KMEANS for 1 dimension///
/// set parameters ///
target_name = 'icSARS' // can only uses data for a single sample (1 dimension)
collection = db.genome_icSARS // give the collection name
var k = 3 // set the number of clusters
   
//aggregated.aggregate([{$match: {'FactorValue [INFECTION CODE]': {$in: [target_name]}}}]); 
// TO DO: this should return a single document

var testarray = aggregated[1].probeArray
var clusters = Array.from(Array(k).keys()) // create clusters
var centroids = testarray.sort(() => Math.random() - Math.random()).slice(0, k) // choose k random values as centroids

function distance(a,b){
    return Math.abs(a-b)}; // calculates euclidian distance for 1 dimension

function mean(element){
    var n = element.length
    var mean = element.reduce((a,b) => a+b)/n;
    return mean}; // calculates mean for an array

do {
    
    var cluster_state = testarray.map(function(val){
        var distances = centroids.map(c => (distance(val,c))) // distance between each centroid and value
        min = Math.min.apply(Math,distances) // min distance
        nearest = distances.indexOf(Math.min.apply(Math,distances)) // get the nearest cluster
        return [val, nearest]
    }) // returns an array for each value with the value and the nearest cluster

    var allclusters = clusters.map(function(cluster){
        var values = cluster_state.map(function(element){
            if (element[1]===cluster){return element[0]}})
        return values
    }); // for each cluster, find the values that belong to that cluster and put them in a new array

    var allclusters = allclusters.map(a => {
        var af = a.filter(c => {
            return c !== undefined;
            });
            return af
        }); // remove the 'undefined' elements
     
    var centroidsnew = allclusters.map(function(cluster){
        var centroid = mean(cluster)
        return centroid
    });// make a new array with the new centroids

    var centroids = centroidsnew;

} while (centroids!==centroidsnew);

var finalClusters = allclusters.map(c => {
    var vals = c
    var cluster = {cluster: allclusters.indexOf(c), values: vals}
    return cluster
    });
    
finalClusters;

// TO DO: how to link them back to their probes?

 