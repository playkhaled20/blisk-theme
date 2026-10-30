import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
exec(open('edit.py').read().split('# 1) bestsellers')[0])
base=Image.open(SRC+'digital_cards-bestsellers.webp').convert('RGB')
k=1.875; X0,Y0=0,88
im=base.crop((X0,Y0,X0+256,Y0+192)).resize((480,360),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0,50,2)).convert('RGBA')
T=lambda pts:[((x-X0)*k,(y-Y0)*k) for x,y in pts]
W,H=600,1100
scr=Image.new('RGBA',(W,H),(10,10,14,255)); d=ImageDraw.Draw(scr)
d.text((48,70),'Game Store',font=F('SemiBold',44),fill=(235,235,240))
g=Image.new('RGBA',(504,318)); gd=ImageDraw.Draw(g)
for i in range(504): gd.line([(i,0),(i,318)],fill=(int(20+30*i/504),int(40+60*i/504),int(110+90*i/504),255))
m=Image.new('L',(504,318),0); ImageDraw.Draw(m).rounded_rectangle([0,0,503,317],34,fill=255); scr.paste(g,(48,170),m)
d.text((84,200),'GAME CARD',font=F('Bold',42),fill=(230,240,255)); d.text((84,370),'50 USD',font=F('Bold',70),fill=(255,255,255))
d.text((48,540),'Top-up code',font=F('Medium',30),fill=(150,150,160)); d.text((48,585),'X7PD - 4KQ2 - 9MZA',font=F('SemiBold',40),fill=(235,235,240))
d.rounded_rectangle([48,700,552,800],28,fill=(90,140,255)); d.text((150,722),'Redeem now',font=F('Bold',42),fill=(255,255,255))
d.text((48,860),'Works on console & PC',font=F('Medium',30),fill=(150,150,160))
warp(im, scr, T([(102,108),(195,122),(131,265),(23,245)]), blur=0.35)
face=card(640,400,[(48,46,'GAME CARD',F('Bold',54),(40,40,44,235)),(48,270,'50',F('Bold',84),(40,40,44,235)),(170,302,'USD',F('SemiBold',40),(40,40,44,215))],None)
warp(im, face, T([(203,177),(331,212),(306,278),(171,240)]), blur=0.5, opacity=.8)
im.convert('RGB').save(SRC+'out-game.webp',quality=86)
