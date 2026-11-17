export const resourceCategories = {financial:'Financial assistance',transportation:'Transportation',meals:'Meals',housing:'Housing',childcare:'Childcare',treatment:'Treatment assistance',emotional:'Emotional support',work:'Work and employment'} as const;
export type AdminState = {error?:string;message?:string};
export function moderationReason(form:FormData) {const raw=form.get('reason');return typeof raw==='string'&&raw.trim().length>=1&&raw.trim().length<=1000?raw.trim():null;}
export function parseResource(form:FormData) {
  const text=(key:string)=>{const value=form.get(key);return typeof value==='string'?value.trim():'';};
  const item={name:text('name'),organization:text('organization'),description:text('description'),category:text('category'),location:text('location'),website_url:text('website'),phone:text('phone'),is_active:form.get('active')==='on'};
  if(!item.name||item.name.length>160||!item.description||item.description.length>5000||item.organization.length>160||item.location.length>160||item.phone.length>40||item.website_url.length>2048||!Object.hasOwn(resourceCategories,item.category))return null;
  if(item.website_url){try{const url=new URL(item.website_url);if(url.protocol!=='https:'||url.username||url.password)return null;}catch{return null;}}
  return item;
}
