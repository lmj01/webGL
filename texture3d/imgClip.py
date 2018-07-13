
'''
参考
https://stackoverflow.com/questions/14138899/how-can-an-almost-arbitrary-plane-in-a-3d-dataset-be-plotted-by-matplotlib?noredirect=1
I had to do something similar for a MRI data enhancement:

Probably the code can be optimized but it works as it is.
My data is 3 dimension numpy array representing an MRI scanner. It has size [128,128,128] but the code can be modified to accept any dimensions. Also when the plane is outside the cube boundary you have to give the default values to the variable fill in the main function, in my case I choose: data_cube[0:5,0:5,0:5].mean()
'''
#
import numpy as np
from PIL import Image

# create normal by point(x,y,z)
def create_normal_vector(x, y,z):
    normal = np.asarray([x,y,z])
    normal = normal/np.sqrt(sum(normal**2))
    return normal

# create the plane by normal and point
def get_plane_equation_parameters(normal,point):
    a,b,c = normal
    d = np.dot(normal,point)
    return a,b,c,d        #ax+by+cz=d  

# 
def get_point_plane_proximity(plane,point):
    #just aproximation
    return np.dot(plane[0:-1],point) - plane[-1]

def get_corner_interesections(plane, cube_dim = 128): #to reduce the search space
    #dimension is 128,128,128
    corners_list = []
    only_x = np.zeros(4)
    min_prox_x = 9999
    min_prox_y = 9999
    min_prox_z = 9999
    min_prox_yz = 9999
    for i in range(cube_dim):
        temp_min_prox_x=abs(get_point_plane_proximity(plane,np.asarray([i,0,0])))
       # print("pseudo distance x: {0}, point: [{1},0,0]".format(temp_min_prox_x,i))
        if temp_min_prox_x <  min_prox_x:
            min_prox_x = temp_min_prox_x
            corner_intersection_x = np.asarray([i,0,0])
            only_x[0]= i

        temp_min_prox_y=abs(get_point_plane_proximity(plane,np.asarray([i,cube_dim,0])))
       # print("pseudo distance y: {0}, point: [{1},{2},0]".format(temp_min_prox_y,i,cube_dim))

        if temp_min_prox_y <  min_prox_y:
            min_prox_y = temp_min_prox_y
            corner_intersection_y = np.asarray([i,cube_dim,0]) 
            only_x[1]= i

        temp_min_prox_z=abs(get_point_plane_proximity(plane,np.asarray([i,0,cube_dim])))
        #print("pseudo distance z: {0}, point: [{1},0,{2}]".format(temp_min_prox_z,i,cube_dim))

        if temp_min_prox_z <  min_prox_z:
            min_prox_z = temp_min_prox_z
            corner_intersection_z = np.asarray([i,0,cube_dim])
            only_x[2]= i

        temp_min_prox_yz=abs(get_point_plane_proximity(plane,np.asarray([i,cube_dim,cube_dim])))
        #print("pseudo distance z: {0}, point: [{1},{2},{2}]".format(temp_min_prox_yz,i,cube_dim))

        if temp_min_prox_yz <  min_prox_yz:
            min_prox_yz = temp_min_prox_yz
            corner_intersection_yz = np.asarray([i,cube_dim,cube_dim])
            only_x[3]= i

    corners_list.append(corner_intersection_x)      
    corners_list.append(corner_intersection_y)            
    corners_list.append(corner_intersection_z)            
    corners_list.append(corner_intersection_yz)
    corners_list.append(only_x.min()) 
    corners_list.append(only_x.max())           

    return corners_list       

def get_points_intersection(plane,min_x,max_x,data_cube,shape=128):

    fill = data_cube[0:5,0:5,0:5].mean() #this can be a parameter
    extended_data_cube = np.ones([shape+2,shape,shape])*fill
    extended_data_cube[1:shape+1,:,:] = data_cube 
    diag_image = np.zeros([shape,shape])
    min_x_value = 999999

    for i in range(shape):

        for j in range(shape):

            for k in range(int(min_x),int(max_x)+1):


                current_value = abs(get_point_plane_proximity(plane,np.asarray([k,i,j])))
                #print("current_value:{0}, val: [{1},{2},{3}]".format(current_value,k,i,j))
                if current_value < min_x_value:
                    diag_image[i,j] = extended_data_cube[k,i,j]
                    min_x_value = current_value

            min_x_value = 999999

    return diag_image  

# volume data
size = 128
data_cube = np.arange((size**3))
data_cube.resize((size,size,size))
data_cube[0:5,0:5,0:5].mean()
# set the normal by x,y,z point
normal = create_normal_vector(5, 23, 1)
# set the point in volume 
point = [size/2,size/2,size/2]
# construct the plane by normal and point, ax+by+cz=d, get [a,b,c,d]
plane1 = get_plane_equation_parameters(normal, point)
# get intersectino the plane with the volume
corners1 = get_corner_interesections(plane1, size)
# calculate teh intersection between the volume and the plane
image1 = get_points_intersection(plane1, corners1[-2], corners1[-1], data_cube,size)
# out the plane
print(image1.size)
print(image1.ndim)
print(image1.shape)
print(image1)

im = Image.new('L',(size,size))
im.putdata(image1)
im.show()