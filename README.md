# Kubernetes Tutorial

## Master Cluster
- Create Master Cluster on [IBM Cloud](https://www.ibm.com/cloud)
- Connect to IBM Cloud 
```ibmcloud login -a cloud.ibm.com -r us-south -g Default --sso```

- Config kubernetes cluster 
```ibmcloud ks cluster-config --cluster node-web-app```

- Config environment variables
```$env:KUBECONFIG = "OUTPUT_OF_LAST_METOD...\bluemix\plugins\container-service\clusters\node-web-app\kube-config-hou02-node-web-app.yml"```

- Check if kubernetes can communicate with master cluster
```kubectl cluster-info```

## Insert docker image

- Add region and user tag

```docker tag node-web-app:latest us.icr.io/verasthiago/node-web-app:latest```

- Login ibmcoud to push image

```ibmcloud cr login```

- Push docker image to ibmcloud namspece

```docker push us.icr.io/verasthiago/node-web-app:latest```

- Check images list

```ibmcloud cr image-list```