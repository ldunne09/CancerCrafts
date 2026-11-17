export const pageNumber=(raw:unknown)=>typeof raw==='string'&&/^\d{1,6}$/.test(raw)?Math.max(1,Number(raw)):1;
