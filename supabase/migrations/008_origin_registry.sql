begin;
-- Verified locality coordinates from GeoNames BG/RS/MK dumps, retrieved 2026-10-28.
-- Reference points only. No products or free-text origins are mapped.
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:726320','BG','Троян',42.89427,24.71589,'https://www.geonames.org/726320/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:726464','BG','Тетевен',42.91667,24.26667,'https://www.geonames.org/726464/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:726629','BG','Сунгурларе',42.76667,26.78333,'https://www.geonames.org/726629/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:727221','BG','Силистра',44.1171,27.26056,'https://www.geonames.org/727221/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:727447','BG','Сандански',41.56667,23.28333,'https://www.geonames.org/727447/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:728108','BG','Поморие',42.56326,27.62986,'https://www.geonames.org/728108/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:730559','BG','Карнобат',42.65,26.98333,'https://www.geonames.org/730559/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:789107','RS','Кралево',43.72583,20.68944,'https://www.geonames.org/789107/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:789128','RS','Крагуевац',44.01667,20.91667,'https://www.geonames.org/789128/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:3188402','RS','Валево',44.27513,19.89821,'https://www.geonames.org/3188402/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:785842','MK','Скопие',41.99646,21.43141,'https://www.geonames.org/785842/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:787716','MK','Неготино',41.48456,22.09056,'https://www.geonames.org/787716/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
insert into public.origin_regions(id,country_id,name,latitude,longitude,source_url,attribution) values('geonames:789541','MK','Кавадарци',41.43344,22.01218,'https://www.geonames.org/789541/','GeoNames, CC BY 4.0') on conflict(id) do nothing;
commit;
