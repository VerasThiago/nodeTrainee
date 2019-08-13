# Kubernetes Tutorial

## Master Cluster
- Create Master Cluster on [IBM Cloud](https://www.ibm.com/cloud)
- Connect to IBM Cloud

```ibmcloud login -a cloud.ibm.com -r us-south -g Default --sso```

- Config kubernetes cluster 

```ibmcloud ks cluster-config --cluster node-web-app```

- Config environment variables (just copy and paste the output from the last step)

```$env:KUBECONFIG = "OUTPUT_OF_LAST_METOD...\kube-config-hou02-node-web-app.yml"```

- Check if kubernetes can communicate with master cluster

```kubectl cluster-info```

## Insert docker image

- Add region and user tag

```docker tag node-web-app:latest us.icr.io/verasthiago/node-web-app:latest```

- Login ibmcoud to push image

```ibmcloud cr login```

- Push docker image to ibmcloud namespece

```docker push us.icr.io/verasthiago/node-web-app:latest```

- Check images list

```ibmcloud cr image-list```

## Deploy app

- Create Pod

```kubectl run mongo --image=mongo --port=27017```

```kubectl run node-web-app --image=us.icr.io/verasthiago/node-web-app:latest --port=80```

- Expose Pod

```kubectl expose deployment mongo --type=NodePort```

```kubectl expose deployment node-web-app --type=NodePort --port=80 --target-port=8080```

## Cheking deployment

- Open UI

```kubectl proxy```

- Combine node external IP with node-web-app service port

```184.172.250.100:32736```  <- It's working!









