import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC='/tmp/claude-0/-home-user/5ebdab82-8ba6-5266-8f23-58a4f5770304/scratchpad/img/'
F=lambda w,s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
def coeffs(dst, src):
    A=[];B=[]
    for (x,y),(X,Y) in zip(dst,src):
        A.append([x,y,1,0,0,0,-X*x,-X*y]); A.append([0,0,0,x,y,1,-Y*x,-Y*y]); B+= [X,Y]
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()
def warp(base, layer, quad, blur=0.4, opacity=1.0):
    """map layer (w,h) onto quad TL,TR,BR,BL of base (all at base scale)"""
    w,h=layer.size; S=4  # supersample
    big=base.size[0]*S, base.size[1]*S
    q=[(x*S,y*S) for x,y in quad]
    c=coeffs(q,[(0,0),(w,0),(w,h),(0,h)])
    out=layer.transform(big, Image.PERSPECTIVE, c, Image.BICUBIC).resize(base.size, Image.LANCZOS)
    if blur: out=out.filter(ImageFilter.GaussianBlur(blur))
    if opacity<1: a=out.split()[3].point(lambda v:int(v*opacity)); out.putalpha(a)
    base.alpha_composite(out); return base
def card(w,h,lines,ink,bg=None,rad=0):
    L=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(L)
    if bg: d.rounded_rectangle([0,0,w-1,h-1],rad,fill=bg)
    for (x,y,t,f,col) in lines: d.text((x,y),t,font=f,fill=col or ink)
    return L

# 1) bestsellers: phone screen shows a digital gift card; the physical card gets a printed face
im=Image.open(SRC+'digital_cards-bestsellers.webp').convert('RGBA')
W,H=600,1100
scr=Image.new('RGBA',(W,H),(14,14,18,255)); d=ImageDraw.Draw(scr)
d.text((48,70),'Wallet',font=F('SemiBold',44),fill=(235,235,240))
# gradient gift card on screen
g=Image.new('RGBA',(504,318)); gd=ImageDraw.Draw(g)
for i in range(504): gd.line([(i,0),(i,318)],fill=(int(40+120*i/504),int(36+90*i/504),int(30+40*i/504),255))
m=Image.new('L',(504,318),0); ImageDraw.Draw(m).rounded_rectangle([0,0,503,317],34,fill=255); scr.paste(g,(48,170),m)
d.text((84,200),'GIFT CARD',font=F('Bold',40),fill=(250,240,220)); d.text((84,380),'100 SAR',font=F('Bold',64),fill=(255,255,255))
d.text((48,540),'Code',font=F('Medium',30),fill=(150,150,160)); d.text((48,585),'4F7K - 92QX - L8MD',font=F('SemiBold',40),fill=(235,235,240))
d.rounded_rectangle([48,700,552,800],28,fill=(217,183,121)); d.text((190,722),'Redeem',font=F('Bold',42),fill=(20,18,14))
d.text((48,860),'Delivered instantly',font=F('Medium',30),fill=(150,150,160))
warp(im, scr, [(102,108),(195,122),(131,265),(23,245)], blur=0.3)
face=card(640,400,[(48,46,'GIFT CARD',F('Bold',54),(40,40,44,235)),(48,270,'100',F('Bold',84),(40,40,44,235)),(250,302,'SAR',F('SemiBold',40),(40,40,44,215))],None)
warp(im, face, [(203,177),(331,212),(306,278),(171,240)], blur=0.5, opacity=.8)
im.convert('RGB').save(SRC+'out-bestsellers.webp',quality=86)

# 2) bundle: the top card of the stack becomes a game top-up card
im=Image.open(SRC+'digital_cards-bundle.webp').convert('RGBA')
face=card(560,360,[(40,36,'GAME CARD',F('Bold',52),(60,40,30,230)),(40,230,'50',F('Bold',86),(60,40,30,230)),(170,262,'USD',F('SemiBold',38),(60,40,30,210))],None)
warp(im, face, [(333,122),(439,186),(383,236),(305,168)], blur=0.5, opacity=.85)
im.convert('RGB').save(SRC+'out-bundle.webp',quality=86)

# 3) featured: the top card of the fan becomes a prepaid gift card
im=Image.open(SRC+'digital_cards-featured.webp').convert('RGBA')
face=card(700,440,[(44,40,'GIFT CARD',F('Bold',60),(70,58,44,225)),(44,300,'500',F('Bold',96),(70,58,44,225))],None)
u=np.array([132,106])/np.hypot(132,106); v=np.array([88,-17])/np.hypot(88,-17)
o=np.array([300,100]); TL=o; TR=o+v*165; BL=o+u*105; BR=TR+u*105
warp(im, face, [tuple(TL),tuple(TR),tuple(BR),tuple(BL)], blur=0.5, opacity=.8)
im.convert('RGB').save(SRC+'out-featured.webp',quality=86)
