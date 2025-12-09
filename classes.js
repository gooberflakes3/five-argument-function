class Prop {
    constructor(type, i, options) {
        try {
        let geometry, material

        this.type = type
        this.x = options.pos[0]
        this.y = options.pos[1]
        this.z = options.pos[2]
        this.rx = options.rot[0]
        this.ry = options.rot[1]
        this.rz = options.rot[2]
        this.l = options.scl?.[0]
        this.w = options.scl?.[1]
        this.h = options.scl?.[2]
        this.r = options.radius
        this.c = options.color
        this.i = i
    
        switch (type) {
            case "cube":
                geometry = new THREE.BoxGeometry( this.w, this.h, this.l );
                material = new THREE.MeshStandardMaterial( { color: this.c, side: THREE.DoubleSide } );
                break
            case "plane":
                const textureLoader = new THREE.TextureLoader(); you need a server for this dumbass.
                const texture = textureLoader.load('./hi.png');
                geometry = new THREE.PlaneGeometry( this.w, this.h );
                material = new THREE.MeshStandardMaterial( { /*color: this.c*/, map: texture, side: THREE.DoubleSide } );
                break
            case "sphere":
                geometry = new THREE.SphereGeometry(this.r, 16, 16)
                material = new THREE.MeshStandardMaterial( { color: this.c, side: THREE.DoubleSide } );
                break
        }
        
        const object = new THREE.Mesh( geometry, material );
        this.object = object
        scene.add( object );
        object.castShadow = true
        object.receiveShadow = true
        object.position.x = this.x
        object.position.y = this.y
        object.position.z = this.z
        object.rotation.x = this.rx * (Math.PI / 180);
        object.rotation.y = this.ry * (Math.PI / 180);
        object.rotation.z = this.rz * (Math.PI / 180);
        objectsarray.push(this)
        } catch (error) {
            alert(`${error}\n---\n${error.stack}`)
        }
    }
}

class PhysicsProp extends Prop {
    constructor(type, i, options, mass) {
        let physicsBody = null
        let shape
        super(type, i, options)
        switch(type) {
        case "cube":
            shape = new CANNON.Box(new CANNON.Vec3(options.scl[1]/2, options.scl[2]/2, options.scl[0]/2));
            physicsBody = new CANNON.Body({ mass: mass });
            physicsBody.addShape(shape);
            physicsBody.position.set(options.pos[0], options.pos[1], options.pos[2]);
            physicsBody.quaternion.setFromEuler(options.rot[0] * (180 / Math.PI), options.rot[1] * (180 / Math.PI), options.rot[2] * (180 / Math.PI))
            break
        case "plane" :
            shape = new CANNON.Plane();
            physicsBody = new CANNON.Body({ mass: 0 }); // static floor
            physicsBody.addShape(shape);
            physicsBody.position.set(options.pos[0], options.pos[1], options.pos[2]);
            break
        case "sphere":
            shape = new CANNON.Sphere(options.radius);
            physicsBody = new CANNON.Body({ mass: mass });
            physicsBody.position.set(options.pos[0], options.pos[1], options.pos[2]);
            physicsBody.addShape(shape);
            break
        }
        this.body = physicsBody
        world.addBody(physicsBody);
    }
}

class Light {
    constructor(type, i, options) {
        this.type = type
        this.i = i
        this.x = options.pos[0]
        this.y = options.pos[1]
        this.z = options.pos[2]
        this.intensity = options.intensity
        this.c = options.color
        let light, target

        switch (type) {
            case "point":
                light = new THREE.PointLight(this.c, this.intensity, 100);
                light.position.set(this.x, this.y, this.z);
            break
            case "dir":
                light = new THREE.DirectionalLight(this.c, this.intensity)
                light.position.set(this.x, this.y, this.y); // where the light comes from
                target = new THREE.Object3D();
                target.position.set(0, 0, 0); // where the light points
                scene.add(target);
                light.target = target;
            break
            case "sun":
                light = new THREE.DirectionalLight(this.c, this.intensity)
                light.position.set(this.x, this.y, this.y); // where the light comes from
                target = new THREE.Object3D();
                target.position.set(0, 0, 0); // where the light points
                scene.add(target);
                light.target = target; // same as dir

                const sphereGeo = new THREE.SphereGeometry(1, 32, 16); // not the same as dir
                const sphereMat = new THREE.MeshStandardMaterial({
                  color: 0xffff00,          // base color (yellow)
                  emissive: 0xffaa00,       // glow color
                  emissiveIntensity: 2,     // how strong the glow looks
                });
                const sunSphere = new THREE.Mesh(sphereGeo, sphereMat);

                light.add(sunSphere);
                sunSphere.position.set(0, 0, 0);
                sunSphere.castShadow = false;
                sunSphere.receiveShadow = false;
                
                light.shadow.camera.left = -50;
                light.shadow.camera.right = 50;
                light.shadow.camera.top = 50;
                light.shadow.camera.bottom = -50;
                light.shadow.camera.near = 1;
                light.shadow.camera.far = 100;
                light.shadow.mapSize.set(4096, 4096); // try 4096 if needed
                light.shadow.bias = -0.0001; // adjust: -0.00005 … -0.001
                // Optional, if bias isn’t enough:
                light.shadow.normalBias = 0.5; // reduces acne on large flat surfaces
            break
        }
        this.object = light
        scene.add(light);
        light.castShadow = true;
        objectsarray.push(this)
    }
}

let objectInterface = {
    confirmExistence() { 
        alert("hi!! :3")
    },

    produce(type, i, options) {
        let prop
        if (type.startsWith("phys")) {
            prop = new PhysicsProp(type.slice(4), i, options, 1)
        } else if (type.startsWith("mapgeo")) {
            prop = new PhysicsProp(type.slice(6), i, options, 0)
        } else if (type.startsWith("light")){
            prop = new Light(type.slice(5), i, options)
        } else {
            prop = new Prop(type, i, options)
        }
        return prop
    },
    
    find(key) {
        try {
        let foundRow = objectsarray.find(row => row.i === key);

        if (foundRow) {
            return foundRow.object
        }
        } catch (error) {
            alert(error)
        }
    },
    findPhys(key) {
        try {
        let foundRow = objectsarray.find(row => row.i === key);

        if (foundRow) {
            return foundRow.body
        }
        } catch (error) {
            alert(error)
        }
    },
    syncGround(body) {
        objectInterface.find("ground").position.copy(body.position);
        objectInterface.find("ground").quaternion.copy(body.quaternion);
    }
}

window.objectInterface = objectInterface
window.Prop = Prop
window.PhysicsProp = PhysicsProp
window.Light = Light
